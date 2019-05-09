import { connect as createPool, Pool, PoolOptions } from '../connectionManager'
import { ManagerConstructor, ManagerBase } from './types'

export type Connection<T = ManagerBase> = T & {
  connect(): void
  getPool(): Pool
  getConfiguration(): PoolOptions
  clear(): Promise<void>
}

export function connectionCreator<T extends ManagerBase>(
  next: ManagerConstructor<T>,
): ManagerConstructor<Connection<T>> {
  return connectionConfig => {
    const manager = next(connectionConfig)
    let pool: Pool | undefined | null

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
