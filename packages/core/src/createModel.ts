import { BaseRecord, SomeRecord } from './types'
import { Mutators } from './repository'
import { ColumnMeta } from './utils/createMetadataManager'

function definePrivate<T extends Function, O>(obj: O, name: string, method: T) {
  const wrappedMethod = method.bind(obj)
  const descriptor = Object.getOwnPropertyDescriptor(obj, name)
  if (descriptor) {
    descriptor.get = (): T => wrappedMethod
  } else {
    Object.defineProperty(obj, name, {
      enumerable: false,
      configurable: false,
      get: (): T => wrappedMethod,
    })
  }
}

export interface ModelMethods<Record> {
  getChanges(): Partial<Record>
  save(): Promise<this>
  isDirty(): boolean
  populate(data: Partial<Record>): void
  remove(): Promise<number>
  refresh(): Promise<void>
}

export type Model<T = BaseRecord> = T & ModelMethods<T>

export function createModel<T extends SomeRecord = BaseRecord>(
  mutators: Mutators<T>,
  model: T,
  isSaved: boolean = true,
): Model<T> {
  let isFetched = isSaved
  let origin: Partial<T> = isFetched ? { ...model } : {}

  function getChanges(): Partial<T> {
    // @ts-ignore Model and ColumnMeta should match
    const columnsMeta: { [key in keyof T]: ColumnMeta } = mutators.getMetadata()
    return Object.keys(columnsMeta).reduce(
      (target: Partial<T>, key: string) =>
        // @ts-ignore
        origin[key] != model[key]
          ? {
              ...target,
              // @ts-ignore
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
        const id = await mutators.insert(changes as T)
        model.id = id
        isFetched = true
      }
      origin = {
        ...model,
      }
    }
    // @ts-ignore We are inside model
    return this
  }

  function isDirty() {
    return !isSaved || Object.keys(getChanges()).length > 0
  }

  function populate(data: Partial<T>): void {
    // @ts-ignore
    Object.keys(data).forEach((key: string): void => (model[key] = data[key]))
  }

  async function remove(): Promise<number> {
    if (isFetched && origin.id) {
      // @ts-ignore We already checked for existing
      await mutators.remove(origin.id)
      isFetched = false
      origin = {}
    }
    return 1
  }

  async function refresh() {
    if (!isFetched && !model.id) {
      throw new Error(`Impossible to refresh record without id field`)
    }
    // origin = await mutators.
  }

  definePrivate(model, 'getChanges', getChanges)
  definePrivate(model, 'save', save)
  definePrivate(model, 'isDirty', isDirty)
  definePrivate(model, 'populate', populate)
  definePrivate(model, 'remove', remove)
  definePrivate(model, 'refresh', refresh)

  return model as Model<T>
}
