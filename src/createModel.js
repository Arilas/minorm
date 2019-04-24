/** @flow */
import type { BaseRecord } from './types'
import type { Mutators } from './repository'

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
  populate(data: { [key: string]: any }): void,
  remove(): Promise<number>,
}>

export function createModel<T: BaseRecord>(
  mutators: Mutators<T>,
  model: T,
  isFetched: boolean = true,
): Model<T> {
  let origin = isFetched ? { ...model } : {}
  definePrivate(model, 'save', async function(): Promise<Model<T>> {
    const columnsMeta = mutators.getMetadata()
    const changes = Object.keys(columnsMeta).reduce(
      (target: any, key: string): any =>
        origin[key] != model[key]
          ? {
              ...target,
              [key]: model[key],
            }
          : target,
      {},
    )
    if (Object.keys(changes).length || !model.id) {
      if (isFetched && model.id) {
        await mutators.update(model.id, changes)
      } else {
        // $FlowIgnore
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
      if (isFetched && model.id) {
        await mutators.remove(model.id)
        isFetched = false
        origin = {}
      }
      return 1
    },
  )

  // $FlowIgnore
  return model
}
