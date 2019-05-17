import insertQuery from '../../query/insert'
import updateQuery from '../../query/update'
import deleteQuery from '../../query/delete'
import {
  InsertQuery,
  UpdateQuery,
  BaseRecord,
  Criteria,
  SomeRecord,
} from '../../types'
import { TableMetadata } from '../../metadata/createMetadataManager'
import { Metadata } from '../../manager/parts'

export interface Mutators<T extends SomeRecord> {
  getMetadata(): TableMetadata
  insert(changes: T): Promise<number | string | undefined>
  update(
    selector: number | string | Criteria,
    changes: Partial<T>,
  ): Promise<number | undefined>
  remove(selector: number | string | Criteria): Promise<number | undefined>
}

export function mutatorsCreator<T extends SomeRecord = BaseRecord>(
  tableName: string,
  manager: Metadata<any, any>, //eslint-disable-line @typescript-eslint/no-explicit-any
) {
  function getMetadata(): TableMetadata {
    const columns = manager.getMetadataManager().getColumns(tableName)
    if (!columns) {
      throw new Error('Metadata is not loaded! Please check bootstrap code')
    }
    return columns
  }

  async function insert(data: T): Promise<string | number | undefined> {
    const query = insertQuery(manager).into(tableName)
    Object.keys(data).forEach(
      // @ts-ignore
      (key: string): InsertQuery => query.set(key, data[key]),
    )
    const result = await query.execute()
    return result.insertId
  }

  async function update(
    selector: string | number | Criteria,
    changes: Partial<T>,
  ): Promise<number | undefined> {
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
      // @ts-ignore
      (key: string): UpdateQuery => query.set(key, changes[key]),
    )
    const result = await query.execute()
    return result.affectedRows
  }

  async function remove(
    selector: number | string | Criteria,
  ): Promise<number | undefined> {
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
    const result = await query.execute()
    return result.affectedRows
  }

  return {
    getMetadata,
    insert,
    update,
    remove,
  }
}
