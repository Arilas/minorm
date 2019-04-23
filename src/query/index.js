/** @flow */
import type { Manager, BaseRecord, SelectQuery } from '../types'
import insert from './insert'
import select from './select'
import update from './update'
import remove from './delete'

export function makeQueryBuilder(manager: Manager) {
  return {
    insert: (options?: any) => insert(manager, options),
    update: (options?: any) => update(manager, options),
    select: <T: BaseRecord>(options?: any): SelectQuery<T> =>
      select(manager, options),
    delete: (options?: any) => remove(manager, options),
    remove: (options?: any) => remove(manager, options),
  }
}
