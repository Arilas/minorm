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
      const id = await repository._save(changes, model.id)
      origin = {
        ...model,
        id: id ? id : model.id
      }
      if (id) {
        model.id = id
      }
    }
    return model
  })
  definePrivate(model, 'populate', data => {
    Object.keys(data).forEach(key => model[key] = data[key])
  })

  return model
}
