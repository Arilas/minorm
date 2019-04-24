/** @flow */
import {
  mutatorsCreator,
  modelsCreator,
  selectorsCreator,
  type Mutators,
  type Models,
  type Selectors,
} from './repository'
import type { Manager } from './createManager'
import type { BaseRecord } from './types'

export type Repository<T: BaseRecord = { [key: string]: any }> = $Exact<{
  ...Mutators<T>,
  ...Models<T>,
  ...Selectors<T>,
}>

export function createRepository<T: BaseRecord>(
  tableName: string,
  manager: Manager,
): Repository<T> {
  const mutators = mutatorsCreator<T>(tableName, manager)
  const models = modelsCreator<T>(tableName, mutators)
  const selectors = selectorsCreator<T>(tableName, manager, models.hydrate)

  return {
    ...mutators,
    ...models,
    ...selectors,
  }
}
