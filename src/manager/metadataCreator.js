/** @flow strict */
import {
  createMetadataManager,
  type MetadataManager,
} from '../utils/createMetadataManager'
import type { ManagerConstructor } from './types'
import type { Queries } from './queriesCreator'

export type Metadata = $Exact<{
  ...Queries,
  getMetadataManager(): MetadataManager,
  setMetadataManager(newMetadataManager: MetadataManager): void,
  ready(): Promise<void>,
  clear(): void,
}>

export function metadataCreator<T: Queries>(
  next: ManagerConstructor<T>,
): ManagerConstructor<
  $Exact<{
    ...T,
    ...Metadata,
  }>,
> {
  return connectionConfig => {
    const manager = next(connectionConfig)
    let metadataManager: MetadataManager = createMetadataManager(manager)

    function getMetadataManager() {
      return metadataManager
    }

    function setMetadataManager(newMetadataManager: MetadataManager) {
      metadataManager = newMetadataManager
    }

    async function ready() {
      // $FlowIgnore
      if (manager.ready) {
        await manager.ready()
      }
      return metadataManager.ready()
    }

    function clear() {
      if (manager.clear) {
        manager.clear()
      }
      metadataManager = createMetadataManager(manager)
    }

    return {
      ...manager,
      ready,
      getMetadataManager,
      setMetadataManager,
      clear,
    }
  }
}
