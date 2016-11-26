/** @flow */
import type {Repository, Model} from './types'

function definePrivate(obj: {[key: string]: any}, name, method) {
  Object.defineProperty(obj, name, {
    enumerable: false,
    configurable: false,
    get: () => method
  })
}

export function createModel(repository: Repository, model: {[key: string]: any} = {}, isFetched: boolean = true): Model {
  let origin = isFetched ? {...model} : {}
  definePrivate(model, 'save', async () => {
    const columnsMeta = await repository.getMetadata()
    const changes = Object.keys(columnsMeta).reduce((target, key) => origin[key] != model[key]
    ? {
      ...target,
      [key]: model[key]
    }
    : target, {})
    if (Object.keys(changes).length || !model.id) {
      if (isFetched && model.id) {
        await repository.update(model.id, changes)
      } else {
        const id = await repository.insert(changes)
        model.id = id
        isFetched = true
      }
      origin = {
        ...model,
      }
    }
    return model
  })
  definePrivate(model, 'populate', data => {
    Object.keys(data).forEach(key => model[key] = data[key])
  })
  definePrivate(model, 'remove', async () => {
    if (isFetched) {
      await repository.remove(model.id)
      isFetched = false
      origin = {}
    }
    return 1
  })

  return model
}
