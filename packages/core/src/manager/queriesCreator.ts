import { QueryBuilder, ParamString } from 'squel'
import { ManagerConstructor, ManagerBase } from './types'
import { RowDataPacket, OkPacket, QueryOptions, Adapter } from '../types'
import { Connection } from './connectionCreator'

export type Queries<
  T extends Connection<ManagerBase, A>,
  A extends Adapter
> = T & {
  query(
    query: QueryBuilder,
    options?: Partial<QueryOptions>,
  ): Promise<[RowDataPacket[][] | RowDataPacket[] | OkPacket, any]>
  execute(
    query: QueryBuilder,
    options?: Partial<QueryOptions>,
  ): Promise<[RowDataPacket[][] | RowDataPacket[] | OkPacket, any]>
}

export function queriesCreator<
  T extends Connection<ManagerBase, A>,
  A extends Adapter
>(next: ManagerConstructor<T, A>): ManagerConstructor<Queries<T, A>, A> {
  return adapter => {
    const manager = next(adapter)

    /**
    This helper is checking that provided query is instance of QueryBuilder or at least provide API to receive sql and values
     */
    const checkForQueryBuilder = (query: QueryBuilder) => {
      if (!query || typeof query.toParam !== 'function') {
        throw new Error('Query Builder instance required')
      }
    }

    /**
    This method of querying information make escaping of query before sending to database.
    It's fast, it's safe, but it's not uses prepare statement, so there's possible some cases in future about this.
     */
    async function query(
      query: QueryBuilder,
      options?: Partial<QueryOptions>,
    ): Promise<[RowDataPacket[][] | RowDataPacket[] | OkPacket, any]> {
      checkForQueryBuilder(query)
      const { stack } = new Error()
      const paramString: ParamString = query.toParam()
      try {
        return await manager.getAdapter().query({
          ...(options || {}),
          sql: paramString.text,
          values: paramString.values,
        })
      } catch (err) {
        const newErr = {
          ...err,
          message: `${err.message}
Query: ${paramString.text}
Call stack for query: ${stack}`,
          stack,
        }
        throw newErr
      }
    }

    /**
    This method of querying information uses prepare-statement, so it's safe from SQL-Injections if you you map your values
     */
    async function execute(
      query: QueryBuilder,
      options?: Partial<QueryOptions>,
    ): Promise<[RowDataPacket[][] | RowDataPacket[] | OkPacket, any]> {
      checkForQueryBuilder(query)
      const { stack } = new Error()
      const paramString: ParamString = query.toParam()
      try {
        return await manager.getAdapter().execute({
          ...(options || {}),
          sql: paramString.text,
          values: paramString.values,
        })
      } catch (err) {
        const newErr = {
          ...err,
          message: `${err.message}
Query: ${paramString.text}
Call stack for query: ${stack}`,
          stack,
        }
        throw newErr
      }
    }

    return {
      ...manager,
      query,
      execute,
    }
  }
}
