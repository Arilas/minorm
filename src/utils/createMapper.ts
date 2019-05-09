import { BaseRecord } from '../types'

export function createMapper() {
  type Hierarchy = BaseRecord
  const hierarchy: { [key: string]: string[] } = {}
  const map: BaseRecord = {}
  let entryPoint: string | undefined

  return {
    setRelation(from: string, alias: string) {
      if (!hierarchy.hasOwnProperty(from)) {
        hierarchy[from] = []
      }
      hierarchy[from].push(alias)
    },
    setEntryPoint(alias: string) {
      entryPoint = alias
    },
    build() {
      if (!entryPoint) {
        throw new Error('Entry point not found')
      }
      function populateMap(target: Hierarchy, entryPoint: string) {
        if (!hierarchy[entryPoint]) {
          return {}
        }
        target[entryPoint] = hierarchy[entryPoint].reduce(
          (target, path) =>
            Object.assign(target, {
              [path]: {},
            }),
          target[entryPoint] || {},
        )
        hierarchy[entryPoint].forEach(path =>
          populateMap(target[entryPoint], path),
        )
        return target[entryPoint]
      }

      return populateMap(map, entryPoint)
    },
    map(rawData: { [key: string]: BaseRecord | null }) {
      if (!entryPoint) {
        throw new Error('Entry point not found')
      }
      if (!rawData || !rawData.hasOwnProperty(entryPoint)) {
        return null
      }
      const map = this.build()
      const result = {
        ...rawData[entryPoint],
        ...map,
        ...(rawData[''] || {}),
      }
      function populateResult(target: Hierarchy, relations: Hierarchy) {
        const keys = Object.keys(relations)
        for (const key of keys) {
          if (rawData[key]) {
            target[key] = {
              ...rawData[key],
              ...relations[key],
            }
            populateResult(target[key], relations[key])
          } else {
            target[key] = null
          }
        }
      }
      populateResult(result, map)

      return result
    },
  }
}
