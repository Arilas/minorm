/** @flow */
import {createRepository} from './createRepository'
import {connect} from './connectionManager'
import insert from './query/insert'
import select from './query/select'
import update from './query/update'
import remove from './query/delete'
import createMetadataManager from './utils/metadataManager'
import type {Manager, MetadataManager} from './types'

export function createManager(connectionConfig: any, logger: ?typeof console = null): Manager {
  let pool
  /**
   * {
   *   tableName: Repository
   * }
   */
  let repos = {}
  let metadataManager: MetadataManager
  let reposirotyFactory = createRepository

  function getPool() {
    if (!pool) {
      const msg = 'Please start connection before'
      logger && logger.error(msg)
      throw new Error(msg)
    }
    return pool
  }

  return {
    connect() {
      if (!metadataManager) {
        metadataManager = createMetadataManager()(this)
      }
      pool = connect(connectionConfig)
      metadataManager.ready()
    },
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
        throw new Error ('Repository Factory must be a function')
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
    query(query) {
      if (typeof query.toParam !== 'function') {
        throw new Error(`manager.query() accepts only queries that implements toParam() method. Try use manager.startQuery()`)
      }
      const {text, values} = query.toParam()
      logger && logger.debug(`SQL query: ${text}`)
      return getPool().query(text, values)
    },
    nestQuery(query) {
      if (typeof query.toParam !== 'function') {
        throw new Error(`manager.query() accepts only queries that implements toParam() method. Try use manager.startQuery()`)
      }
      const {text, values} = query.toParam()
      logger && logger.debug(`SQL query: ${text}`)
      return getPool().query({
        sql: text,
        nestTables: true
      }, values)
    },
    startQuery() {
      return {
        insert: options => insert(this, options),
        update: options => update(this, options),
        select: options => select(this, options),
        delete: options => remove(this, options),
        remove: options => remove(this, options)
      }
    }
  }
}
