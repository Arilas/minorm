import { createBaseManager } from './parts'
import { makeQueryBuilder } from '../query'
import { Adapter } from '../types'
import { ManagerBase } from './types'

interface QueryBuilder extends ManagerBase {
  startQuery(): ReturnType<typeof makeQueryBuilder>
}

export function createManager<A extends Adapter = Adapter>(adapter: A) {
  const baseManager = createBaseManager<QueryBuilder, A>(() => ({
    startQuery(): ReturnType<typeof makeQueryBuilder> {
      return makeQueryBuilder(baseManager)
    },
  }))(adapter)

  return baseManager
}
export type Manager = ReturnType<typeof createManager>
