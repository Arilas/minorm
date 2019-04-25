/** @flow strict */
import { createRepository, type Repository } from '../createRepository'
import type { BaseRecord } from '../types'
import type { ManagerConstructor } from './types'
import type { Metadata } from './metadataCreator'

export type Repositories = $Exact<{
  ...Metadata,
  getRepository<Record: BaseRecord>(tableName: string): Repository<Record>,
  clear(): Promise<void>,
}>

export function repositoryCreator<T: Metadata>(
  next: ManagerConstructor<T>,
): ManagerConstructor<
  $Exact<{
    ...T,
    ...Repositories,
  }>,
> {
  return connectionConfig => {
    const manager = next(connectionConfig)
    let repos: { [key: string]: Repository<*> } = {}

    function getRepository<Record: BaseRecord>(
      tableName: string,
    ): Repository<Record> {
      if (repos.hasOwnProperty(tableName)) {
        // $FlowIgnore we assign it one time
        return repos[tableName]
      }
      repos[tableName] = createRepository(tableName, manager)
      // $FlowIgnore we assign it one time
      return repos[tableName]
    }

    async function clear() {
      if (manager.clear) {
        await manager.clear()
      }
      repos = {}
    }

    return {
      ...manager,
      getRepository,
      clear,
    }
  }
}
