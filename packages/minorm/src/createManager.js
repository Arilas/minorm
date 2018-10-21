/** @flow */
import {createRepository} from './createRepository'
import {connect} from './connectionManager'
import {makeQueryBuilder} from './query'
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
      const { stack } = new Error
      const {text, values} = query.toParam()
      logger && logger.debug(`SQL query: ${text}`)
      return getPool().query(text, values).catch(
        err => {
          const newErr = new Error(`${err.message}
Query: ${text}
Call stack for query: ${stack}
`)
          // newErr.stack = stack
          throw newErr
        }
      )
    },
    nestQuery(query) {
      if (typeof query.toParam !== 'function') {
        throw new Error(`manager.query() accepts only queries that implements toParam() method. Try use manager.startQuery()`)
      }
      const { stack } = new Error
      const {text, values} = query.toParam()
      logger && logger.debug(`SQL query: ${text}`)
      return getPool().query({
        sql: text,
        nestTables: true
      }, values).catch(
        err => {
          const newErr = new Error(`${err.message}
Query: ${text}
Call stack for query: ${stack}
`)
          throw newErr
        }
      )
    },
    startQuery() {
      return makeQueryBuilder(this)
    }
  }
}
