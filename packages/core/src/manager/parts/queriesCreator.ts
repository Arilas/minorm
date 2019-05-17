import { QueryBuilder } from 'squel'
import { ManagerConstructor, ManagerBase } from '../types'
import { RowDataPacket, OkPacket, QueryOptions, Adapter } from '../../types'
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
    const { query, execute } = adapter

    return {
      ...manager,
      query,
      execute,
    }
  }
}
