/** @flow */
import { type Model } from '../createModel'
import type { BaseRecord, Criteria, SelectQuery } from '../types'
import type { Manager } from '../createManager'

export type Selectors<T: BaseRecord> = $Exact<{
  find(id: number): Promise<Model<T> | null>,
  findOneBy(criteria: Criteria): Promise<Model<T> | null>,
  findBy(
    criteria: Criteria,
    orderBy?: { [key: string]: boolean },
    limit?: number,
    offset?: number,
  ): Promise<Array<Model<T>>>,
  startQuery(alias?: string): SelectQuery<T>,
}>

export function selectorsCreator<T: BaseRecord>(
  tableName: string,
  manager: Manager,
  hydrator: <Record: T>(entity: T, isSaved?: boolean) => Model<T>,
): Selectors<T> {
  function startQuery<Record: T>(alias?: string): SelectQuery<Record> {
    return manager
      .startQuery()
      .select()
      .from(tableName, alias)
      .field(alias ? `${alias}.*` : '*')
  }

  async function doSelect<Record: T>(
    selector: (query: SelectQuery<*>) => any,
  ): Promise<Array<Model<Record>>> {
    const query = startQuery<Record>()
    selector(query)
    const entities: Array<Record> = await query.execute()

    // $FlowIgnore
    return entities.map(entity => hydrator(entity, true))
  }

  async function find(id: number | string): Promise<Model<T> | null> {
    const results: Array<Model<T>> = await doSelect(query =>
      query.where('id = ?', id).limit(1),
    )
    if (results.length == 0) {
      return null
    }
    return results[0]
  }

  async function findOneBy(criteria: Criteria): Promise<Model<T> | null> {
    const results: Array<Model<T>> = await doSelect(query =>
      query.criteria(criteria).limit(1),
    )
    if (results.length == 0) {
      return null
    }
    return results[0]
  }

  function findBy(
    criteria: Criteria,
    orderBy?: { [key: string]: boolean } = {},
    limit?: number,
    offset?: number,
  ): Promise<Array<Model<T>>> {
    return doSelect<T>(query => {
      query.criteria(criteria)
      if (limit) {
        query.limit(limit)
      }
      if (offset) {
        query.offset(offset)
      }
      if (orderBy) {
        Object.keys(orderBy).forEach(key => query.order(key, orderBy[key]))
      }
    })
  }

  return {
    startQuery,
    find,
    findOneBy,
    findBy,
  }
}
