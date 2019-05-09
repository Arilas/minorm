import { createContext } from './gateways'
import { SchemaToolContext } from './types'
import { MetadataManager } from '../utils/createMetadataManager'

interface CreateContext {
  context: SchemaToolContext
  getPreQueries(): string[]
  getAddQueries(): string[]
  getDropQueries(): string[]
  getAddAlters(): string[]
  getDropAlters(): string[]
  getPostQueries(): string[]
  resetQueries(): void
}

export function createMigrationContext(
  metadataManager: MetadataManager,
): CreateContext {
  const { context, getGateways, reset } = createContext(metadataManager)
  return {
    context,
    getPreQueries(): string[] {
      return getGateways()
        .map(gateway => gateway.getPreQueries())
        .reduce(
          (target, query) => (!query ? target : [...target, ...query]),
          [],
        )
    },
    getAddQueries(): string[] {
      return getGateways()
        .map(gateway => gateway.getAddQueries())
        .reduce(
          (target, query) => (!query ? target : [...target, ...query]),
          [],
        )
    },
    getDropQueries(): string[] {
      return getGateways()
        .map(gateway => gateway.getDropQueries())
        .reduce(
          (target, query) => (!query ? target : [...target, ...query]),
          [],
        )
    },
    getAddAlters(): string[] {
      return getGateways()
        .map(gateway => gateway.getAddAlterQueries())
        .reduce((target, alters) => [...target, ...alters], [])
    },
    getDropAlters(): string[] {
      return getGateways()
        .map(gateway => gateway.getDropAlterQueries())
        .reduce((target, alters) => [...target, ...alters], [])
    },
    getPostQueries(): string[] {
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
