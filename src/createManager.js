/** @flow */
import Squel from 'squel'
import {createRepository} from './createRepository'
import {connect} from './connectionManager'
import select from './query/select'
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
    },
    extendRepository(tableName, callback) {
      repos[tableName] = callback(this.getRepository(tableName))
    },
    getRepository(tableName) {
      if (!repos.hasOwnProperty(tableName)) {
        repos[tableName] = createRepository(tableName, this)
      }

      return repos[tableName]
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
    query(sql, values) {
      if (typeof sql.toParam === 'function') {
        sql = sql.toParam()
        logger && logger.debug(`SQL query: ${sql.text}`)
        return getPool().query(sql.text, sql.values)
      }
      // $FlowIgnore impossible situation
      logger && logger.debug(`SQL query: ${sql}`)
      return getPool().query(sql, values)
    },
    nestQuery(sql) {
      if (typeof sql.toParam === 'function') {
        sql = sql.toParam()
      }
      if (sql.text != null && sql.values != null) {
        return getPool().query({
          // $FlowIgnore I've already check this
          sql: sql.text,
          nestTables: true
          // $FlowIgnore I've already check this
        }, sql.values)
      } else {
        throw new Error('nestQuery accepts Squel query or result of query.toParam()')
      }
    },
    startQuery() {
      return {
        ...Squel,
        select: options => select(this, options)
      }
    }
  }
}
