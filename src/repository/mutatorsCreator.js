/** @flow */
import type {
  InsertQuery,
  UpdateQuery,
  BaseRecord,
  TableMetadata,
} from '../types'
import type { Manager } from '../createManager'

export type Mutators<T: BaseRecord> = $Exact<{
  getMetadata(): TableMetadata,
  insert(changes: T): Promise<number>,
  update(
    selector: number | { [key: string]: any },
    changes: { [key: string]: any },
  ): Promise<number>,
  remove(selector: number | { [key: string]: any }): Promise<number>,
}>

export function mutatorsCreator<T: BaseRecord>(
  tableName: string,
  manager: Manager,
): Mutators<T> {
  function getMetadata(): TableMetadata {
    if (!manager.getMetadataManager().hasTable(tableName)) {
      throw new Error('Metadata is not loaded! Please check bootstrap code')
    }
    return manager.getMetadataManager().getColumns(tableName)
  }

  function insert(data: T): Promise<number> {
    const query = manager
      .startQuery()
      .insert()
      .into(tableName)
    Object.keys(data).forEach(
      (key: string): InsertQuery => query.set(key, data[key]),
    )
    return query.execute().then((result: any): number => result.insertId)
  }

  function update(
    selector: number | { [key: string]: any },
    changes: $Shape<T>,
  ): Promise<number> {
    if (!selector || !changes) {
      throw new Error(
        'Please check that you provide selector and changes for update',
      )
    }
    if (typeof selector !== 'object') {
      selector = {
        id: selector,
      }
    }
    const query = manager
      .startQuery()
      .update()
      .criteria(selector)
      .table(tableName)
    Object.keys(changes).forEach(
      (key: string): UpdateQuery => query.set(key, changes[key]),
    )
    return query.execute().then((result: any): number => result.affectedRows)
  }

  function remove(selector: number | { [key: string]: any }): Promise<number> {
    if (!selector) {
      throw new Error('Please provide selector for remove')
    }
    if (typeof selector !== 'object') {
      selector = {
        id: selector,
      }
    }
    const query = manager
      .startQuery()
      .delete()
      .criteria(selector)
      .from(tableName)
    return query.execute().then((result: any): number => result.affectedRows)
  }

  return {
    getMetadata,
    insert,
    update,
    remove,
  }
}
