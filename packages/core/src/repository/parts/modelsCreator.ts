import { createModel, Model } from '../../createModel'
import { BaseRecord, SomeRecord } from '../../types'
import { Mutators } from './mutatorsCreator'

export interface Models<T extends SomeRecord = BaseRecord> {
  create<Q extends T = T>(entity?: Partial<Q>): Model<Q>
  hydrate<Q extends T = T>(entity: Partial<Q>, isSaved?: boolean): Model<Q>
}

export function modelsCreator<T extends SomeRecord = BaseRecord>(
  mutators: Mutators<T>,
): Models<T> {
  function hydrate<Record extends T = T>(
    entity: Partial<Record>,
    isSaved = false,
  ): Model<Record> {
    // @ts-ignore
    return createModel<Record>(mutators, entity, isSaved)
  }

  function create<Record extends T = T>(
    data: Partial<Record> = {},
  ): Model<Record> {
    return hydrate(data)
  }

  return {
    hydrate,
    create,
  }
}
