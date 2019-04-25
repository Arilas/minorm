/** @flow strict */
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
  clear(): Promise<void>,
}>

export function connectionCreator<T: {}>(
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

    /**
    This method is used to create a connection pool which is required to start working with database
     */
    function connect() {
      pool = createPool(connectionConfig)
    }

    /**
    This method is used to receive pool, which is used to execute a queries.
    Example of use:
    ```js
    const user = await manager.getPool().execute('SELECT * FROM users WHERE id = ?', [5])
    ```
     */
    function getPool(): Pool {
      if (!pool) {
        throw new Error('Please connect before')
      }
      return pool
    }

    /**
    This method is returning original configuration object
     */
    function getConfiguration() {
      return connectionConfig
    }

    /**
    This method is used to end pool connection and also clear manager state
     */
    async function clear() {
      // $FlowIgnore
      if (manager.clear) {
        await manager.clear()
      }
      if (pool) {
        await pool.end()
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
