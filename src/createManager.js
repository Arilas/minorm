/** @flow */
import { createBaseManager, type Repositories } from './manager'
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

export function createManager(connectionConfig: any): Manager {
  const baseManager = createBaseManager(() => ({}))(connectionConfig)

  return {
    ...baseManager,
    startQuery() {
      return makeQueryBuilder(baseManager)
    },
  }
}
