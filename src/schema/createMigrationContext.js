/** @flow */

import {createContext} from './gateways'
import type {SchemaToolContext} from './types'
import type {MetadataManager} from '../types'

type CreateContext = {
  context: SchemaToolContext,
  getPreQueries(): Array<string>,
  getAddQueries(): Array<string>,
  getDropQueries(): Array<string>,
  getAddAlters(): Array<string>,
  getDropAlters(): Array<string>,
  getPostQueries(): Array<string>
}

export function createMigrationContext(metadataManager: MetadataManager): CreateContext {
  const {context, gateways} = createContext(metadataManager)
  return {
    context,
    getPreQueries(): Array<string> {
      return gateways
      .map(gateway => gateway.getPreQueries())
      .reduce((target, query) => !query ? target : [
        ...target,
        ...query
      ], [])

    },
    getAddQueries(): Array<string> {
      return gateways
        .map(gateway => gateway.getAddQueries())
        .reduce((target, query) => !query ? target : [
          ...target,
          ...query
        ], [])
    },
    getDropQueries(): Array<string> {
      return gateways
        .map(gateway => gateway.getDropQueries())
        .reduce((target, query) => !query ? target : [
          ...target,
          ...query
        ], [])
    },
    getAddAlters(): Array<string> {
      return gateways.map(gateway => gateway.getAddAlterQueries()).reduce((target, alters) => ([
        ...target,
        ...alters
      ]), [])
    },
    getDropAlters(): Array<string> {
      return gateways.map(gateway => gateway.getDropAlterQueries()).reduce((target, alters) => ([
        ...target,
        ...alters
      ]), [])
    },
    getPostQueries(): Array<string> {
      return gateways
        .map(gateway => gateway.getPostQueries())
        .reduce((target, query) => !query ? target : [
          ...target,
          ...query
        ], [])
    }
  }
}
