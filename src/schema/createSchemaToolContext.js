/** @flow */

import {createTableBuilder, useTableBuilder} from './tablebuilder'
import type {SchemaToolGateway, SchemaToolContext} from './types'

type CreateContext = {
  context: SchemaToolContext,
  getQueries(): Array<string>,
  getAlters(): Array<string>
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
          getQuery() {
            return `DROP TABLE ${tableName}`
          },
          getAlters() {
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
    getQueries(): Array<string> {
      return gateways
        .map(gateway => gateway.getQuery())
        .reduce((target, query) => !query ? target : [
          ...target,
          query
        ], [])
    },
    getAlters(): Array<string> {
      return gateways.map(gateway => gateway.getAlters()).reduce((target, alters) => ([
        ...target,
        ...alters
      ]), [])
    }
  }
}
