/** @flow */

import {createTableBuilder, useTableBuilder} from './tablebuilder'
import type {SchemaToolGateway, SchemaToolContext} from './types'

type CreateContext = {
  context: SchemaToolContext,
  getAddQueries(): Array<string>,
  getDropQueries(): Array<string>,
  getAddAlters(): Array<string>,
  getDropAlters(): Array<string>
}

export function createSchemaToolContext(): CreateContext {
  const gateways: Array<SchemaToolGateway> = []
  return {
    context: {
      table(tableName, callback): SchemaToolGateway {
        const gateway = createTableBuilder(tableName, callback)
        gateways.push(gateway)
        return gateway
      },
      use(tableName: string, callback): SchemaToolGateway {
        const gateway = useTableBuilder(tableName, callback)
        gateways.push(gateway)
        return gateway
      },
      dropTable(tableName): SchemaToolGateway {
        const gateway = {
          getAddQuery() {
            return []
          },
          getDropQuery() {
            return [`DROP TABLE ${tableName}`]
          },
          getAddAlters() {
            return []
          },
          getDropAlters() {
            return []
          },
          getApi() {
            return null
          }
        }
        gateways.push(gateway)
        return gateway
      }
    },
    getAddQueries(): Array<string> {
      return gateways
        .map(gateway => gateway.getAddQuery())
        .reduce((target, query) => !query ? target : [
          ...target,
          ...query
        ], [])
    },
    getDropQueries(): Array<string> {
      return gateways
        .map(gateway => gateway.getDropQuery())
        .reduce((target, query) => !query ? target : [
          ...target,
          ...query
        ], [])
    },
    getAddAlters(): Array<string> {
      return gateways.map(gateway => gateway.getAddAlters()).reduce((target, alters) => ([
        ...target,
        ...alters
      ]), [])
    },
    getDropAlters(): Array<string> {
      return gateways.map(gateway => gateway.getDropAlters()).reduce((target, alters) => ([
        ...target,
        ...alters
      ]), [])
    }
  }
}
