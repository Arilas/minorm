import { QueryBuilderOptions } from 'squel'
import { Metadata } from '../manager'
import { BaseRecord, SelectQuery } from '../types'
import insert from './insert'
import select from './select'
import update from './update'
import remove from './delete'

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export function makeQueryBuilder(manager: Metadata<any, any>) {
  return {
    insert: (options?: QueryBuilderOptions) => insert(manager, options),
    update: (options?: QueryBuilderOptions) => update(manager, options),
    select: <T = BaseRecord>(options?: QueryBuilderOptions): SelectQuery<T> =>
      select(manager, options),
    delete: (options?: QueryBuilderOptions) => remove(manager, options),
    remove: (options?: QueryBuilderOptions) => remove(manager, options),
  }
}
