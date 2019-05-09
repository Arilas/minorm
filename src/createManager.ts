import { createBaseManager } from './manager'
import { PoolOptions } from './connectionManager'
import { makeQueryBuilder } from './query'

export function createManager(connectionConfig: PoolOptions) {
  const baseManager = createBaseManager(() => ({
    startQuery(): ReturnType<typeof makeQueryBuilder> {
      return makeQueryBuilder(baseManager)
    },
  }))(connectionConfig)

  return baseManager
}
export type Manager = ReturnType<typeof createManager>
