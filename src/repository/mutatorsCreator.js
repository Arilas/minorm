/** @flow strict */
import insertQuery from '../query/insert'
import updateQuery from '../query/update'
import deleteQuery from '../query/delete'
import type { InsertQuery, UpdateQuery, BaseRecord, Criteria } from '../types'
import type { TableMetadata } from '../utils/createMetadataManager'
import type { Metadata } from '../manager'

export type Mutators<T: BaseRecord> = $Exact<{
  getMetadata(): TableMetadata,
  insert(changes: T): Promise<?number | string>,
  update(
    selector: number | string | Criteria,
    changes: $Shape<T>,
  ): Promise<?number | string>,
  remove(selector: number | string | Criteria): Promise<?number | string>,
}>

export function mutatorsCreator<T: BaseRecord>(
  tableName: string,
  manager: { ...Metadata },
): Mutators<T> {
  function getMetadata(): TableMetadata {
    if (!manager.getMetadataManager().hasTable(tableName)) {
      throw new Error('Metadata is not loaded! Please check bootstrap code')
    }
    return manager.getMetadataManager().getColumns(tableName)
  }

  function insert(data: T): Promise<?string | number> {
    const query = insertQuery(manager).into(tableName)
    Object.keys(data).forEach(
      (key: string): InsertQuery => query.set(key, data[key]),
    )
    return query.execute().then((result): ?string | number => result.insertId)
  }

  function update(
    selector: string | number | Criteria,
    changes: $Shape<T>,
  ): Promise<?string | number> {
    if (!selector || !changes) {
      throw new Error(
        'Please check that you provide selector and changes for update',
      )
    }
    let cond: Criteria =
      typeof selector === 'number' || typeof selector === 'string'
        ? {
            id: selector,
          }
        : selector
    const query = updateQuery(manager)
      .criteria(cond)
      .table(tableName)
    Object.keys(changes).forEach(
      (key: string): UpdateQuery => query.set(key, changes[key]),
    )
    return query.execute().then((result): ?number => result.affectedRows)
  }

  function remove(
    selector: number | string | Criteria,
  ): Promise<?number | string> {
    if (!selector) {
      throw new Error('Please provide selector for remove')
    }
    let cond: Criteria =
      typeof selector === 'number' || typeof selector === 'string'
        ? {
            id: selector,
          }
        : selector
    const query = deleteQuery(manager)
      .criteria(cond)
      .from(tableName)
    return query
      .execute()
      .then((result): ?number | string => result.affectedRows)
  }

  return {
    getMetadata,
    insert,
    update,
    remove,
  }
}
