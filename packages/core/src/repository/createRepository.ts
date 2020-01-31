import {
  mutatorsCreator,
  modelsCreator,
  selectorsCreator,
  Mutators,
  Models,
  Selectors,
} from './parts'
import { Metadata } from '../manager/parts'
import { BaseRecord, SomeRecord } from '../types'

export type Repository<T = BaseRecord> = Mutators<T> & Models<T> & Selectors<T>

export function createRepository<T extends SomeRecord = BaseRecord>(
  tableName: string,
  manager: Metadata<any, any>, //eslint-disable-line @typescript-eslint/no-explicit-any
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
