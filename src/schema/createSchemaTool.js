/** @flow */
import {createTableBuilder, useTableBuilder} from './tablebuilder'
import {initMinormSchema, dropMinormSchema} from './initMinormSchema'
import type {SchemaTool, SchemaToolGateway, SchemaToolContext} from './types'
import type {Manager} from '../types'

type CreateContext = {
  context: SchemaToolContext,
  getQueries(): Array<string>,
  getAlters(): Array<string>
}

function createContext(): CreateContext {
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

export function createSchemaTool(manager: Manager): SchemaTool {
  let schemaInit = () => {}
  let schemaDrop = () => {}
  return {
    setSchemaInit(callback) {
      schemaInit = callback
    },
    setSchemaDrop(callback) {
      schemaDrop = callback
    },
    async initSchema() {
      const {context, getQueries, getAlters} = createContext()
      schemaInit(context)
      initMinormSchema(context)
      try {
        await Promise.all(getQueries().map(line => manager.getPool().execute(line)))
        await Promise.all(getAlters().map(line => manager.getPool().execute(line)))
        return true
      } catch (err) {
        console.error('There\'s a problem with database init', err)
        throw err
      }
    },
    async dropSchema() {
      const {context, getQueries, getAlters} = createContext()
      schemaDrop(context)
      dropMinormSchema(context)
      const alters = getAlters()
      const queries = getQueries()
      try {
        await Promise.all(alters.map(line => manager.getPool().execute(line)))
        do {
          const query = queries.shift()
          await manager.getPool().execute(query)
        } while (queries.length)
        return true
      } catch (err) {
        console.error('There\'s a problem with database init', err)
        throw err
      }
    },
    async useTable(tableName: string, callback: Function) {
      const gateway = useTableBuilder(tableName, callback)
      try {
        await Promise.all(gateway.getAlters().map(line => manager.getPool().execute(line)))
        return true
      } catch (err) {
        console.error('There\'s a problem with database init', err)
        throw err
      }
    },
    async dropTable(tableName: string) {
      return await manager.getPool().execute(
        `DROP TABLE ${tableName}`
      )
    }
  }
}
