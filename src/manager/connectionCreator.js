/** @flow */
import {
  connect as createPool,
  type Pool,
  type PoolOptions,
} from '../connectionManager'
import type { ManagerConstructor } from './types'

export type Connection = $Exact<{
  connect(): void,
  getPool(): Pool,
  getConfiguration(): PoolOptions,
  clear(): void,
}>

export function connectionCreator<T: any>(
  next: ManagerConstructor<T>,
): ManagerConstructor<
  $Exact<{
    ...T,
    ...Connection,
  }>,
> {
  return connectionConfig => {
    const manager = next(connectionConfig)
    let pool: ?Pool

    function connect() {
      pool = createPool(connectionConfig)
    }

    function getPool(): Pool {
      if (!pool) {
        throw new Error('Please connect before')
      }
      return pool
    }

    function getConfiguration() {
      return connectionConfig
    }

    function clear() {
      if (manager.clear) {
        manager.clear()
      }
      pool = null
    }

    return {
      ...manager,
      clear,
      connect,
      getPool,
      getConfiguration,
    }
  }
}
