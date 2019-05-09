import {
  mutatorsCreator,
  modelsCreator,
  selectorsCreator,
  Mutators,
  Models,
  Selectors,
} from './repository'
import { Metadata } from './manager'
import { BaseRecord, SomeRecord } from './types'

export type Repository<T = BaseRecord> = Mutators<T> & Models<T> & Selectors<T>

export function createRepository<T extends SomeRecord = BaseRecord>(
  tableName: string,
  manager: Metadata,
): Repository<T> {
  const mutators = mutatorsCreator<T>(tableName, manager)
  const models = modelsCreator<T>(mutators)
  // @ts-ignore
  const selectors = selectorsCreator<T>(tableName, manager, models.hydrate)

  return {
    ...mutators,
    ...models,
    ...selectors,
  }
}
