/** @flow */
import {createModel} from './createModel'
import type { InsertQuery, UpdateQuery, Repository, Manager, BaseRecord, TableMetadata, Model, Criteria, SelectQuery } from './types'

export function createRepository<T: BaseRecord>(tableName: string, manager: Manager): Repository<T> {
  const repo = {
    async getMetadata(): Promise<TableMetadata> {
      await manager.getMetadataManager().ready()
      return manager.getMetadataManager().getColumns(tableName)
    },
    find(id: number): Promise<Model<T> | null> {
      const query: SelectQuery<T> = this.startQuery()
        .where('id = ?', id)
      return query
        .execute()
        .then((result: Array<T>): Model<T> | null => result.length > 0 ? this.hydrate(result.pop(), true) : null)
    },
    findOneBy(criteria: Criteria): Promise<Model<T> | null> {
      const query: SelectQuery<T> = this.startQuery()
        .limit(1)
        .criteria(criteria)
      return query
        .execute()
        .then((result: Array<T>): Model<T> | null => result.length > 0 ? this.hydrate(result.pop(), true) : null)
    },
    findBy(criteria: Criteria, orderBy?: { [key: string]: boolean } = {}, limit?: number, offset?: number): Promise<Array<Model<T>>> {
      const query: SelectQuery<T> = this.startQuery()
        .criteria(criteria)
      limit && query.limit(limit)
      offset && query.offset(offset)
      orderBy && Object.keys(orderBy).forEach(key => query.order(key, orderBy[key]))
      return query.execute().then((result: Array<T>): Array<Model<T>> => result.map((entry: T): Model<T> => this.hydrate(entry, true)))
    },
    startQuery(alias: ?string = null): SelectQuery<T> {
      return manager.startQuery()
        .select()
        .from(tableName, alias)
        .field(alias ? `${alias}.*` : '*')
    },
    create<Q: T>(data: any = {}): Model<Q> {
      return this.hydrate(data)
    },
    hydrate(data: T, fetched: boolean = false): Model<T> {
      return createModel(this, data, fetched)
    },
    insert(data: T): Promise<number> {
      const query = manager.startQuery().insert()
        .into(tableName)
      Object.keys(data).forEach((key: string): InsertQuery => query.set(key, data[key]))
      return query.execute().then((result: any): number => result.insertId)
    },
    update(selector: number | { [key: string]: any }, changes: { [key: string]: any }): Promise<number> {
      if (!selector || !changes) {
        throw new Error('Please check that you provide selector and changes for update')
      }
      if (typeof selector !== 'object') {
        selector = {
          id: selector
        }
      }
      const query = manager.startQuery().update()
        .criteria(selector)
        .table(tableName)
      Object.keys(changes).forEach((key: string): UpdateQuery => query.set(key, changes[key]))
      return query.execute().then((result: any): number => result.affectedRows)
    },
    remove(selector: number | { [key: string]: any }): Promise<number> {
      if (!selector) {
        throw new Error('Please provide selector for remove')
      }
      if (typeof selector !== 'object') {
        selector = {
          id: selector
        }
      }
      const query = manager.startQuery().delete()
        .from(tableName)
        .criteria(selector)
      return query.execute().then((result: any): number => result.affectedRows)
    }
  }

  return repo
}
