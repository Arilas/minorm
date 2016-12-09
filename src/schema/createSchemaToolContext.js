/** @flow */

import {createTableBuilder} from './tablebuilder'
import insert from '../query/insert'
import type {SchemaToolGateway, SchemaToolContext} from './types'
import type {MetadataManager} from '../types'

type CreateContext = {
  context: SchemaToolContext,
  getAddQueries(): Array<string>,
  getDropQueries(): Array<string>,
  getAddAlters(): Array<string>,
  getDropAlters(): Array<string>
}

export function createSchemaToolContext(metadataManager: MetadataManager): CreateContext {
  const gateways: Array<SchemaToolGateway> = []
  function getTableGateway(tableName, callback) {
    const gateway = createTableBuilder(tableName, callback, !metadataManager.hasTable(tableName))
    gateways.push(gateway)
    return gateway
  }
  return {
    context: {
      table: getTableGateway,
      use: getTableGateway,
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
      },
      put(tableName, entities): void {
        gateways.push({
          getAddQuery() {
            return []
          },
          getDropQuery() {
            return []
          },
          getDropAlters() {
            return []
          },
          getApi() {
            return null
          },
          getAddAlters() {
            return [
              // $FlowIgnore
              insert({}).into(tableName).setFieldsRows(entities).toString()
            ]
          }
        })
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
