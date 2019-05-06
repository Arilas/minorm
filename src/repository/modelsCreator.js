/** @flow strict */
import { createModel, type Model } from '../createModel'
import type { BaseRecord } from '../types'
import type { Mutators } from './mutatorsCreator'

export type Models<T: BaseRecord> = $Exact<{
  create<Q: T>(entity?: Q): Model<Q>,
  hydrate(entity: T, isSaved?: boolean): Model<T>,
}>

export function modelsCreator<T: BaseRecord>(
  tableName: string,
  mutators: Mutators<T>,
): Models<T> {
  function hydrate<Record: T>(
    entity: $Shape<Record>,
    isSaved: boolean = false,
  ): Model<Record> {
    // $FlowFixMe
    return createModel<Record>(mutators, entity, isSaved)
  }

  const defaultObj: BaseRecord = {}

  function create<Record: T>(data: $Shape<Record> = defaultObj): Model<Record> {
    return hydrate(data)
  }

  return {
    hydrate,
    create,
  }
}
