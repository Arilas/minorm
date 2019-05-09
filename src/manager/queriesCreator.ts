import { deprecate } from '../utils/deprecation'
import { QueryBuilder, ParamString } from 'squel'
import {
  QueryResult,
  QueryOptions,
  RowDataPacket,
  OkPacket,
} from '../connectionManager'
import { ManagerConstructor } from './types'
import { Connection } from './connectionCreator'

export type Queries<T = Connection> = T & {
  query(
    query: QueryBuilder,
    options?: Partial<QueryOptions>,
  ): QueryResult<RowDataPacket[][] | RowDataPacket[] | OkPacket>
  execute(
    query: QueryBuilder,
    options?: Partial<QueryOptions>,
  ): QueryResult<RowDataPacket[][] | RowDataPacket[] | OkPacket>
  nestQuery(
    query: QueryBuilder,
    options?: Partial<QueryOptions>,
  ): QueryResult<RowDataPacket[][]>
}

export function queriesCreator<T extends Connection>(
  next: ManagerConstructor<T>,
): ManagerConstructor<Queries<T>> {
  return connectionConfig => {
    const manager = next(connectionConfig)

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
    ): QueryResult<RowDataPacket[][] | RowDataPacket[] | OkPacket> {
      checkForQueryBuilder(query)
      const { stack } = new Error()
      const paramString: ParamString = query.toParam()
      try {
        return await manager.getPool().query({
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
    ): QueryResult<RowDataPacket[][] | RowDataPacket[] | OkPacket> {
      checkForQueryBuilder(query)
      const { stack } = new Error()
      const paramString: ParamString = query.toParam()
      try {
        return await manager.getPool().execute({
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
    This method is used to query information with flag nestTables enabled by default. Please consider usage:
    `query.getMapper().fetch()` or `query.execute(true)`(which is the same as this query) or
    `manager.execute(query, { nestTables:tru })`
    @deprecated
     */
    async function nestQuery(
      query: QueryBuilder,
      options?: Partial<QueryOptions>,
    ): QueryResult<RowDataPacket[][]> {
      deprecate(
        'Manager.nestQuery() is deprecated. Please use QueryBuilder.getMapper().fetch() or QueryBuilder.execute(true) or even manager.execute(queryBuilder, { nestTables: true })',
      )
      checkForQueryBuilder(query)
      const { stack } = new Error()
      const paramString: ParamString = query.toParam()
      try {
        return await manager.getPool().execute({
          ...(options || {}),
          nestTables: true,
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
      nestQuery,
    }
  }
}
