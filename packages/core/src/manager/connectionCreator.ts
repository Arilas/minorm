import { ManagerConstructor, ManagerBase } from './types'
import { Adapter } from '../types'

export type Connection<T extends ManagerBase, A extends Adapter> = T & {
  connect(): void
  getAdapter(): A
  clear(): Promise<void>
}

export function connectionCreator<T extends ManagerBase, A extends Adapter>(
  next: ManagerConstructor<T, A>,
): ManagerConstructor<Connection<T, A>, A> {
  return adapter => {
    const manager = next(adapter)

    /**
    This method is used to receive adapter, which is used to execute a queries.
    Example of use:
    ```js
    const user = await manager.getAdapter().execute('SELECT * FROM users WHERE id = ?', [5])
    ```
     */
    function getAdapter(): A {
      return adapter
    }

    function connect() {
      adapter.init()
    }

    /**
    This method is used to end pool connection and also clear manager state
     */
    async function clear() {
      if (manager.clear) {
        await manager.clear()
      }
      await adapter.end()
    }

    return {
      ...manager,
      connect,
      clear,
      getAdapter,
    }
  }
}
