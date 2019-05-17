import selectQuery from '../../query/select'
import { Model } from '../../createModel'
import { BaseRecord, Criteria, SelectQuery } from '../../types'
import { Metadata } from '../../manager/parts'

export interface Selectors<T = BaseRecord> {
  find(id: number): Promise<Model<T> | null>
  findOneBy(criteria: Criteria): Promise<Model<T> | null>
  findBy(
    criteria: Criteria,
    orderBy?: { [key: string]: boolean },
    limit?: number,
    offset?: number,
  ): Promise<Model<T>[]>
  startQuery<Record = T>(alias?: string): SelectQuery<Record>
}

export function selectorsCreator<T = BaseRecord>(
  tableName: string,
  manager: Metadata<any, any>, //eslint-disable-line @typescript-eslint/no-explicit-any
  hydrator: <T>(entity: T, isSaved?: boolean) => Model<T>,
): Selectors<T> {
  function startQuery<Record = T>(alias?: string): SelectQuery<Record> {
    return selectQuery<Record>(manager)
      .from(tableName, alias)
      .field(alias ? `${alias}.*` : '*')
  }

  async function doSelect<Record = T>(
    selector: (query: SelectQuery<Record>) => SelectQuery<Record> | void,
  ): Promise<Model<Record>[]> {
    const query = startQuery<Record>()
    selector(query)
    const entities: Record[] = await query.execute()

    return entities.map(entity => hydrator<Record>(entity, true))
  }

  async function find(id: number | string): Promise<Model<T> | null> {
    const results: Model<T>[] = await doSelect(query =>
      query.where('id = ?', id).limit(1),
    )
    if (results.length == 0) {
      return null
    }
    return results[0]
  }

  async function findOneBy(criteria: Criteria): Promise<Model<T> | null> {
    const results: Model<T>[] = await doSelect(query =>
      query.criteria(criteria).limit(1),
    )
    if (results.length == 0) {
      return null
    }
    return results[0]
  }

  function findBy(
    criteria: Criteria,
    orderBy?: { [key: string]: boolean },
    limit?: number,
    offset?: number,
  ): Promise<Model<T>[]> {
    return doSelect<T>(query => {
      query.criteria(criteria)
      if (orderBy) {
        Object.keys(orderBy).forEach(key => query.order(key, orderBy[key]))
      }
      if (limit) {
        query.limit(limit)
      }
      if (offset) {
        query.offset(offset)
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
