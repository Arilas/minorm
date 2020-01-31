import { BaseRecord } from '../types'

export function createMapper() {
  const reverseMap: { [key: string]: string } = {}
  let entryPoint: string | undefined

  function setRelation(from: string, alias: string) {
    if (reverseMap[alias]) {
      throw new Error(`Alias ${alias} is already registered`)
    }
    reverseMap[alias] = from
  }

  function setEntryPoint(alias: string) {
    entryPoint = alias
  }

  function map(rawData: { [key: string]: BaseRecord | null }) {
    if (!entryPoint) {
      throw new Error('Entry point not found')
    }
    if (!rawData || rawData == null || !rawData.hasOwnProperty(entryPoint)) {
      return null
    }
    if (rawData['']) {
      rawData[entryPoint] = {
        ...rawData[entryPoint],
        ...rawData[''],
      }
    }

    for (const alias of Object.keys(rawData)) {
      const data = rawData[alias]
      const targetPath = reverseMap[alias]
      if (!targetPath || !rawData[targetPath]) {
        continue
      }
      if (data && data.id != null) {
        // @ts-ignore
        rawData[targetPath][alias] = data
      } else {
        // @ts-ignore
        rawData[targetPath][alias] = null
      }
    }
    return rawData[entryPoint]
  }
  return {
    setEntryPoint,
    setRelation,
    map,
  }
}
