/** @flow strict */
import type { BaseRecord } from './types'
import type { Mutators } from './repository'
import type { ColumnMeta } from './utils/createMetadataManager'

// $FlowIgnore
function definePrivate<T: Function, O>(obj: O, name: string, method: T) {
  const wrappedMethod = method.bind(obj)
  Object.defineProperty(obj, name, {
    enumerable: false,
    configurable: false,
    get: (): T => wrappedMethod,
  })
}

export type Model<Record: BaseRecord> = $Exact<{
  ...Record,
  getChanges(): $Shape<Record>,
  save(): Promise<Model<Record>>,
  isDirty(): boolean,
  populate(data: $Shape<Record>): void,
  remove(): Promise<number>,
}>

export function createModel<T: BaseRecord>(
  mutators: Mutators<T>,
  model: $Shape<T>,
  isSaved: boolean = true,
): Model<T> {
  let isFetched = isSaved
  let origin: $Shape<T> = isFetched ? { ...model } : {}

  function getChanges(): $Shape<T> {
    // $FlowIgnore
    const columnsMeta: { [key: $Keys<T>]: ColumnMeta } = mutators.getMetadata()
    return Object.keys(columnsMeta).reduce(
      (target: $Shape<T>, key: string) =>
        origin[key] != model[key]
          ? {
              ...target,
              [key]: model[key],
            }
          : target,
      {},
    )
  }

  async function save(): Promise<Model<T>> {
    const changes = getChanges()
    if (Object.keys(changes).length || (!model.id || !isFetched)) {
      if (isFetched && origin.id && model.id) {
        await mutators.update(origin.id, changes)
      } else {
        const id = await mutators.insert(changes)
        model.id = id
        isFetched = true
      }
      origin = {
        ...model,
      }
    }
    return this
  }

  function isDirty() {
    return !isSaved || Object.keys(getChanges()).length > 0
  }

  function populate(data: $Shape<T>): void {
    Object.keys(data).forEach((key: string): void => (model[key] = data[key]))
  }

  async function remove(): Promise<number> {
    if (isFetched && origin.id) {
      await mutators.remove(origin.id)
      isFetched = false
      origin = {}
    }
    return 1
  }

  definePrivate(model, 'getChanges', getChanges)
  definePrivate(model, 'save', save)
  definePrivate(model, 'isDirty', isDirty)
  definePrivate(model, 'populate', populate)
  definePrivate(model, 'remove', remove)

  // $FlowIgnore
  return model
}
