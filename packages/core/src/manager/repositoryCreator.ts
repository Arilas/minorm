import { createRepository, Repository } from '../createRepository'
import { BaseRecord, Adapter } from '../types'
import { ManagerConstructor, ManagerBase } from './types'
import { Metadata } from './metadataCreator'
import { Queries } from '.'
import { Connection } from './connectionCreator'

export type Repositories<
  T extends Metadata<Queries<Connection<ManagerBase, A>, A>, A>,
  A extends Adapter
> = T & {
  getRepository<Record = BaseRecord>(tableName: string): Repository<Record>
  clear(): Promise<void>
}

export function repositoryCreator<
  T extends Metadata<Queries<Connection<ManagerBase, A>, A>, A>,
  A extends Adapter
>(next: ManagerConstructor<T, A>): ManagerConstructor<Repositories<T, A>, A> {
  return adapter => {
    const manager = next(adapter)
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
