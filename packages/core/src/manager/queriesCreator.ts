import { QueryBuilder } from 'squel'
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
  ): Promise<[RowDataPacket[][] | RowDataPacket[] | OkPacket, any]> //eslint-disable-line @typescript-eslint/no-explicit-any
  execute(
    query: QueryBuilder,
    options?: Partial<QueryOptions>,
  ): Promise<[RowDataPacket[][] | RowDataPacket[] | OkPacket, any]> //eslint-disable-line @typescript-eslint/no-explicit-any
}

export function queriesCreator<
  T extends Connection<ManagerBase, A>,
  A extends Adapter
>(next: ManagerConstructor<T, A>): ManagerConstructor<Queries<T, A>, A> {
  return adapter => {
    const manager = next(adapter)

    /**
    This method of querying information make escaping of query before sending to database.
    It's fast, it's safe, but it's not uses prepare statement, so there's possible some cases in future about this.
     */
    function query(
      query: QueryBuilder,
      options?: Partial<QueryOptions>,
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<[RowDataPacket[][] | RowDataPacket[] | OkPacket, any]> {
      return adapter.query(query, options)
    }

    /**
    This method of querying information uses prepare-statement, so it's safe from SQL-Injections if you you map your values
     */
    function execute(
      query: QueryBuilder,
      options?: Partial<QueryOptions>,
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<[RowDataPacket[][] | RowDataPacket[] | OkPacket, any]> {
      return adapter.execute(query, options)
    }

    return {
      ...manager,
      query,
      execute,
    }
  }
}
