/** @flow strict */
import { createBaseManager, type Repositories } from './manager'
import type { PoolOptions } from './connectionManager'
import { makeQueryBuilder } from './query'
import type {
  BaseRecord,
  InsertQuery,
  SelectQuery,
  UpdateQuery,
  DeleteQuery,
} from './types'

export type Manager = $Exact<{
  ...Repositories,
  startQuery(): {
    insert(): InsertQuery,
    select<T: BaseRecord>(): SelectQuery<T>,
    update(): UpdateQuery,
    delete(): DeleteQuery,
    remove(): DeleteQuery,
  },
}>

export function createManager(connectionConfig: PoolOptions): Manager {
  const baseManager = createBaseManager(() => ({
    startQuery() {
      return makeQueryBuilder(baseManager)
    },
  }))(connectionConfig)
  // baseManager.foo.trim()

  return baseManager
}
