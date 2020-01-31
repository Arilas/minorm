import squel, { QueryBuilderOptions } from 'squel'
import { Metadata } from '../manager/parts'
import { BaseRecord, SelectQuery } from '../types'
import insert from './insert'
import select from './select'
import update from './update'
import remove from './delete'

export const insertQuery = insert
export const selectQuery = select
export const updateQuery = update
export const removeQuery = remove

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export function makeQueryBuilder(manager: Metadata<any, any>) {
  return {
    ...squel,
    insert: (options?: QueryBuilderOptions | null) => insert(manager, options),
    update: (options?: QueryBuilderOptions | null) => update(manager, options),
    select: <T = BaseRecord>(
      options?: QueryBuilderOptions | null,
    ): SelectQuery<T> => select(manager, options),
    delete: (options?: QueryBuilderOptions | null) => remove(manager, options),
    remove: (options?: QueryBuilderOptions | null) => remove(manager, options),
  }
}
