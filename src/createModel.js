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
  save(): Promise<Model<Record>>,
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
  definePrivate(model, 'save', async function(): Promise<Model<T>> {
    // $FlowIgnore
    const columnsMeta: { [key: $Keys<T>]: ColumnMeta } = mutators.getMetadata()
    const changes: $Shape<T> = Object.keys(columnsMeta).reduce(
      (target: $Shape<T>, key: string) =>
        origin[key] != model[key]
          ? {
              ...target,
              [key]: model[key],
            }
          : target,
      {},
    )
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
  })
  definePrivate(model, 'populate', (data: T) => {
    Object.keys(data).forEach((key: string): void => (model[key] = data[key]))
  })
  definePrivate(
    model,
    'remove',
    async (): Promise<number> => {
      if (isFetched && origin.id) {
        await mutators.remove(origin.id)
        isFetched = false
        origin = {}
      }
      return 1
    },
  )

  // $FlowIgnore
  return model
}
