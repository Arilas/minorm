/** @flow */
import Squel from 'squel'
import {createModel} from './createModel'
import type {Repository, ColumnsMeta, Manager} from './types'

const METADATA_QUERY = 'SELECT COLUMN_NAME columnName,REFERENCED_TABLE_NAME tableName,REFERENCED_COLUMN_NAME referencedColumnName FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL'
const COLUMNS_QUERY = 'SHOW COLUMNS FROM ??'

function mapCriteriaToQuery(criteria, query) {
  Object.keys(criteria).map(key => {
    if (
      ['string', 'number'].indexOf(typeof criteria[key]) != -1
    ) {
      query.where(
        `${key} = ?`,
        criteria[key]
      )
    } else if (typeof criteria[key] == 'object') {
      const operator = Object.keys(criteria[key])[0]
      switch(operator) {
        case '$in': 
          query.where(
            `${key} IN ?`,
            criteria[key][operator]
          )
          break
        case '$not':
          query.where(
            `${key} != ?`,
            criteria[key][operator]
          )
          break
        case '$notIn': 
          query.where(
            `${key} NOT IN ?`,
            criteria[key][operator]
          )
          break
        case '$like':
          query.where(
            `${key} LIKE ?`,
            criteria[key][operator]
          )
          break
      }
    }
  })
}

function loadRelations(manager: Manager, tableName: string) {
  manager.query(
    METADATA_QUERY,
    [tableName]
  ).then(([relations]) => manager.getMetadataManager().setAssociations(tableName, relations)).catch(err => console.error(err)) //eslint-disable-line no-console
}

function loadColumns(manager: Manager, tableName: string): Promise<ColumnsMeta> {
  return manager.query(
    COLUMNS_QUERY,
    [tableName]
  ).then(([result]) => result.reduce((target, column) => ({
    ...target,
    [column.Field]: column
  }), {}))
}

export function createRepository(tableName: string, manager: Manager): Repository {
  manager.hasOwnProperty('getMetadataManager') && loadRelations(manager, tableName)
  let columnsMeta = loadColumns(manager, tableName).then(columns => columnsMeta = columns)
  const repo = {
    getMetadata() {
      if (columnsMeta instanceof Promise) {
        return columnsMeta
      } else {
        return Promise.resolve(columnsMeta)
      }
    },
    find(id: any) {
      const query = this.startQuery()
        .where('id = ?', id)
        .toParam()
      return manager.query(
        query.text,
        query.values
      ).then(([result]) => result.length ? createModel(repo, result[0]) : null)
    },
    findOneBy(criteria) {
      const query = this.startQuery()
        .limit(1)
        .criteria(criteria)
      const sql = query.toParam()
      return manager.query(
        sql.text,
        sql.values
      ).then(([result]) => result.length ? createModel(repo, result[0]) : null)
    },
    findBy(criteria, orderBy = {}, limit, offset) {
      const query = this.startQuery()
        .criteria(criteria)
      limit && query.limit(limit)
      offset && query.offset(offset)
      const sql = query.toParam()
      return manager.query(
        sql.text,
        sql.values
      ).then(([result]) => result.map(createModel.bind(null, repo)))
    },
    startQuery(alias: ?string = null) {
      return manager.startQuery()
        .select()
        .from(tableName, alias)
        .field(alias ? `${alias}.*` : '*')
    },
    create(data = {}) {
      return this.hydrate(data)
    },
    hydrate(data = {}, fetched: boolean = false) {
      return createModel(repo, data, fetched)
    },
    _save(changes, id) {
      let query
      if (id) {
        query = Squel.update()
          .where('id = ?', id)
          .table(tableName)
      } else {
        query = Squel.insert()
          .into(tableName)
      }
      Object.keys(changes).forEach(key => query.set(key, changes[key]))
      const sql = query.toParam()
      return manager.query(
        sql.text,
        sql.values
      ).then(([result]) => result.insertId)
    }
  }

  return repo
}
