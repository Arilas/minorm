/** @flow */
import {createModel} from './createModel'
import type {Repository, Manager} from './types'

export function createRepository(tableName: string, manager: Manager): Repository {
  const repo = {
    async getMetadata() {
      await manager.getMetadataManager().ready()
      return manager.getMetadataManager().getColumns(tableName)
    },
    find(id: any) {
      const query = this.startQuery()
        .where('id = ?', id)
      return query.execute().then(result => result.length ? createModel(repo, result[0]) : null)
    },
    findOneBy(criteria) {
      const query = this.startQuery()
        .limit(1)
        .criteria(criteria)
      return query.execute().then(result => result.length ? createModel(repo, result[0]) : null)
    },
    findBy(criteria, orderBy = {}, limit, offset) {
      const query = this.startQuery()
        .criteria(criteria)
      limit && query.limit(limit)
      offset && query.offset(offset)
      return query.execute().then(result => result.map(createModel.bind(null, repo)))
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
    insert(data = {}) {
      const query = manager.startQuery().insert()
        .into(tableName)
      Object.keys(data).forEach(key => query.set(key, data[key]))
      return query.execute().then(result => result.insertId)
    },
    update(selector, changes) {
      if (typeof selector !== 'object') {
        selector = {
          id: selector
        }
      }
      const query = manager.startQuery().update()
        .criteria(selector)
        .table(tableName)
      Object.keys(changes).forEach(key => query.set(key, changes[key]))
      return query.execute().then(result => result.affectedRows)
    },
    remove(selector) {
      if (typeof selector !== 'object') {
        selector = {
          id: selector
        }
      }
      const query = manager.startQuery().delete()
        .criteria(selector)
      return query.execute().then(result => result.affectedRows)
    }
  }

  return repo
}
