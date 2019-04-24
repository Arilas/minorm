/** @flow strict */
import type { QueryBuilderOptions } from 'squel'
import type { Metadata } from '../manager'
import type { BaseRecord, SelectQuery } from '../types'
import insert from './insert'
import select from './select'
import update from './update'
import remove from './delete'

export function makeQueryBuilder(manager: { ...Metadata }) {
  return {
    insert: (options?: QueryBuilderOptions) => insert(manager, options),
    update: (options?: QueryBuilderOptions) => update(manager, options),
    select: <T: BaseRecord>(options?: QueryBuilderOptions): SelectQuery<T> =>
      select(manager, options),
    delete: (options?: QueryBuilderOptions) => remove(manager, options),
    remove: (options?: QueryBuilderOptions) => remove(manager, options),
  }
}
