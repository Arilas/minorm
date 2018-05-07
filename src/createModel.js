/** @flow */
import type { BaseRecord, Repository, Model} from './types'

function definePrivate<T, O>(obj: O, name: string, method: T) {
  Object.defineProperty(obj, name, {
    enumerable: false,
    configurable: false,
    get: (): T => method
  })
}

export function createModel<T: BaseRecord>(repository: Repository<T>, model: T, isFetched: boolean = true): Model<T> {
  let origin = isFetched ? {...model} : {}
  definePrivate(model, 'save', async (): Promise<Model<T>> => {
    const columnsMeta = await repository.getMetadata()
    const changes = Object.keys(columnsMeta).reduce((target: any, key: string): any => origin[key] != model[key]
    ? {
      ...target,
      [key]: model[key]
    }
    : target, {})
    if (Object.keys(changes).length || !model.id) {
      if (isFetched && model.id) {
        await repository.update(model.id, changes)
      } else {
        // $FlowIgnore
        const id = await repository.insert(changes)
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
    Object.keys(data).forEach((key: string): void => model[key] = data[key])
  })
  definePrivate(model, 'remove', async (): Promise<number> => {
    if (isFetched && model.id) {
      await repository.remove(model.id)
      isFetched = false
      origin = {}
    }
    return 1
  })

  // $FlowIgnore
  return model
}
