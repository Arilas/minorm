/** @flow strict */
import type { BaseRecord } from '../types'

export function createMapper() {
  const hierarchy = {}
  const map = {}
  let entryPoint

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
      function populateMap(target, entryPoint) {
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
    map(rawData: { [key: string]: ?BaseRecord }) {
      if (!rawData || !rawData.hasOwnProperty(entryPoint)) {
        return null
      }
      const map = this.build()
      const result = {
        ...rawData[entryPoint],
        ...map,
        ...(rawData[''] || {}),
      }
      function populateResult(target, relations) {
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
