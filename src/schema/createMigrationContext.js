/** @flow */

import { createContext } from './gateways'
import type { SchemaToolContext } from './types'
import type { MetadataManager } from '../utils/createMetadataManager'

type CreateContext = {
  context: SchemaToolContext,
  getPreQueries(): Array<string>,
  getAddQueries(): Array<string>,
  getDropQueries(): Array<string>,
  getAddAlters(): Array<string>,
  getDropAlters(): Array<string>,
  getPostQueries(): Array<string>,
  resetQueries(): void,
}

export function createMigrationContext(
  metadataManager: MetadataManager,
): CreateContext {
  const { context, getGateways, reset } = createContext(metadataManager)
  return {
    context,
    getPreQueries(): Array<string> {
      return getGateways()
        .map(gateway => gateway.getPreQueries())
        .reduce(
          (target, query) => (!query ? target : [...target, ...query]),
          [],
        )
    },
    getAddQueries(): Array<string> {
      return getGateways()
        .map(gateway => gateway.getAddQueries())
        .reduce(
          (target, query) => (!query ? target : [...target, ...query]),
          [],
        )
    },
    getDropQueries(): Array<string> {
      return getGateways()
        .map(gateway => gateway.getDropQueries())
        .reduce(
          (target, query) => (!query ? target : [...target, ...query]),
          [],
        )
    },
    getAddAlters(): Array<string> {
      return getGateways()
        .map(gateway => gateway.getAddAlterQueries())
        .reduce((target, alters) => [...target, ...alters], [])
    },
    getDropAlters(): Array<string> {
      return getGateways()
        .map(gateway => gateway.getDropAlterQueries())
        .reduce((target, alters) => [...target, ...alters], [])
    },
    getPostQueries(): Array<string> {
      return getGateways()
        .map(gateway => gateway.getPostQueries())
        .reduce(
          (target, query) => (!query ? target : [...target, ...query]),
          [],
        )
    },
    resetQueries: reset,
  }
}
