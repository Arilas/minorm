import { createRepository, Repository } from '../createRepository'
import { BaseRecord } from '../types'
import { ManagerConstructor } from './types'
import { Metadata } from './metadataCreator'

export type Repositories<T = Metadata> = T & {
  getRepository<Record = BaseRecord>(tableName: string): Repository<Record>
  clear(): Promise<void>
}

export function repositoryCreator<T extends Metadata>(
  next: ManagerConstructor<T>,
): ManagerConstructor<Repositories<T>> {
  return connectionConfig => {
    const manager = next(connectionConfig)
    let repos: { [key: string]: Repository } = {}

    function getRepository<Record = BaseRecord>(
      tableName: string,
    ): Repository<Record> {
      if (repos.hasOwnProperty(tableName)) {
        return repos[tableName] as Repository<Record>
      }
      repos[tableName] = createRepository(tableName, manager)
      return repos[tableName] as Repository<Record>
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
