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
  clear(): Promise<void>,
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

    /**
    This method is used to receive MetadataManager which contains all information about your database.
    This information include all tables and columns in database and also relations between your tables
     */
    function getMetadataManager() {
      return metadataManager
    }

    /**
    This method is used to replace MetadataManager with other implementation.
    It's useful for a test environment where you don't need to load Metadata from a server, but just need to use prepared data
     */
    function setMetadataManager(newMetadataManager: MetadataManager) {
      metadataManager = newMetadataManager
    }

    /**
    This method is used to start preparing manager for a use
     */
    async function ready() {
      // $FlowIgnore
      if (manager.ready) {
        await manager.ready()
      }
      return metadataManager.ready()
    }

    /**
    This method is used to clear manager and MetadataManager state
     */
    async function clear() {
      if (manager.clear) {
        await manager.clear()
      }
      metadataManager.clear()
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
