/** @flow */
import MySQL from 'mysql2/promise'
import Squel from 'squel'
import {createRepository} from './createRepository'
import type {Manager, Relation} from './types'

export function createManager(connectionConfig: any, logger?: typeof console = false): Manager {
  const pool = MySQL.createPool(connectionConfig)
  /**
   * {
   *   tableName: Repository
   * }
   */
  let repos = {}
  /**
   * {
   *   tableName1: {
   *     columnName1: {
   *       tableName: string, //Table to join with
   *       columnName: string, //Inner column name in tableName1
   *       referencedColumnName: string //Column in joined tabls
   *     }
   *   }
   * }
   */
  let associations: {[key: string]: {[key: string]: Relation}} = {}

  return {
    extendRepository(tableName, callback) {
      repos[tableName] = callback(this.getRepository(tableName))
    },
    getRepository(tableName) {
      if (!repos.hasOwnProperty(tableName)) {
        repos[tableName] = createRepository(tableName, this)
      }

      return repos[tableName]
    },
    getPool() {
      return pool
    },
    clear() {
      repos = {}
      associations = {}
    },
    getConnection() {
      return pool.getConnection()
    },
    query(sql, values) {
      if (typeof sql.toParam === 'function') {
        sql = sql.toParam()
        logger && logger.debug(`SQL query: ${sql.text}`)
        return pool.query(sql.text, sql.values)
      }
      // $FlowIgnore impossible situation
      logger && logger.debug(`SQL query: ${sql}`)
      return pool.query(sql, values)
    },
    nestQuery(sql) {
      if (typeof sql.toParam === 'function') {
        sql = sql.toParam()
      }
      if (sql.text != null && sql.values != null) {
        return pool.query({
          sql: sql.text,
          nestTables: true
        }, sql.values)
      } else {
        throw new Error('nestQuery accepts Squel query or result of query.toParam()')
      }
    },
    _setRelationFrom(tableName, relations) {
      logger && logger.debug(`Loaded relations for ${tableName} with associations: ${relations.map(r => r.columnName).join(', ')}`) 
      if (associations.hasOwnProperty(tableName)) {
        logger && logger.warn(`Twice Loaded meta for table ${tableName}. Please check that you use manager.getRepository() method`)
        return
      }
      associations[tableName] = relations.reduce((target, relation) => this.getRepository(relation.tableName) && ({
        ...target,
        [relation.columnName]: relation
      }), {})
    },
    startQuery() {
      return {
        ...Squel,
        select() {
          const
            query = Squel.select()
          function prepareJoin(fromAlias: string, columnName: string, alias: string) {
            const tables = [
              ...query.blocks[4]._tables, //FROM part
              ...query.blocks[5]._joins //JOIN part
            ]
            const table = tables.filter(table => table.alias == fromAlias)
            if (!table.length) {
              throw new Error(`${fromAlias} not found in query`)
            }
            const originTableName = table[0].table
            if (!associations.hasOwnProperty(originTableName) || !associations[originTableName].hasOwnProperty(columnName)) {
              const msg = `Foreign key ${columnName} is not found in ${originTableName}. Try to get Repository for ${originTableName} to load relations.`
              logger &&  logger.error(msg)
              throw new Error(msg)
            }
            const relation: Relation = associations[originTableName][columnName]
            const onPart = `${alias}.${relation.referencedColumnName} = ${fromAlias}.${relation.columnName}`
            return [relation.tableName, alias, onPart]
          }
          query.include = (fromAlias: string, columnName: string, alias: string) => {
            if (!alias) {
              alias = columnName.replace('_id', '')
            }
            query.join(...prepareJoin(fromAlias, columnName, alias))
            return query.field(`\`${alias}\`.*`)
          }
          query.tryInclude = (fromAlias: string, columnName: string, alias: string) => {
            if (!alias) {
              alias = columnName.replace('_id', '')
            }
            query.left_join(...prepareJoin(fromAlias, columnName, alias))
            return query.field(`\`${alias}\`.*`)
          }
          query.execute = (nested: boolean) => //eslint-disable-line arrow-parens
            (nested ? this.nestQuery(query) : this.query(query))
            .then(([result]) => result)

          return query
        }
      }
    }
  }
}
