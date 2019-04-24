/** @flow */
import { queriesCreator, type Queries } from './manager'
import { createRepository, type Repository } from './createRepository'
import {
  connect as createPool,
  type Pool,
  type Connection,
} from './connectionManager'
import { makeQueryBuilder } from './query'
import createMetadataManager from './utils/metadataManager'
import type {
  MetadataManager,
  BaseRecord,
  InsertQuery,
  SelectQuery,
  UpdateQuery,
  DeleteQuery,
} from './types'

export type Manager = $Exact<{
  ...Queries,
  connect(): void,
  getRepository<T: BaseRecord>(tableName: string): Repository<T>,
  extendRepository(
    tableName: string,
    callback: (repo: Repository<>) => { ...Repository<> },
  ): void,
  setRepositoryFactory(
    factory: (tableName: string, manager: Manager) => Repository<>,
  ): void,
  getLogger(): ?typeof console,
  ready(): Promise<any>,
  getPool(): Pool,
  clear(): void,
  getMetadataManager(): MetadataManager,
  setMetadataManager(manager: MetadataManager): void,
  getConnection(): Promise<Connection>,
  getConfiguration(): { [key: string]: any },
  startQuery(): {
    insert(): InsertQuery,
    select<T: BaseRecord>(): SelectQuery<T>,
    update(): UpdateQuery,
    delete(): DeleteQuery,
    remove(): DeleteQuery,
  },
}>

export function createManager(
  connectionConfig: any,
  logger: ?typeof console = null,
): Manager {
  // MySQL2 Connection Pool
  let pool: ?Pool
  /**
   * {
   *   tableName: Repository
   * }
   */
  let repos = {}
  let metadataManager: MetadataManager
  let reposirotyFactory = createRepository

  function connect() {
    if (!metadataManager) {
      metadataManager = createMetadataManager()(this)
    }
    pool = createPool(connectionConfig)
    metadataManager.ready()
  }

  function getPool() {
    if (!pool) {
      const msg = 'Please start connection before'
      throw new Error(msg)
    }
    return pool
  }

  const queries = queriesCreator(getPool)

  return {
    ...queries,
    connect,
    async ready() {
      return await metadataManager.ready()
    },
    getConfiguration() {
      return connectionConfig
    },
    extendRepository(tableName, callback) {
      repos[tableName] = callback(this.getRepository(tableName))
    },
    getRepository(tableName) {
      if (!repos.hasOwnProperty(tableName)) {
        repos[tableName] = reposirotyFactory(tableName, this)
      }

      return repos[tableName]
    },
    setRepositoryFactory(factory) {
      if (typeof factory != 'function') {
        throw new Error('Repository Factory must be a function')
      }
      reposirotyFactory = factory
    },
    getLogger() {
      return logger
    },
    getPool,
    clear() {
      pool = null
      repos = {}
      metadataManager.clear()
    },
    getMetadataManager() {
      return metadataManager
    },
    setMetadataManager(manager) {
      metadataManager = manager
    },
    getConnection() {
      return getPool().getConnection()
    },
    startQuery() {
      return makeQueryBuilder(this)
    },
  }
}
