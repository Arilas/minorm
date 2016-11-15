import {createTableBuilder, useTableBuilder} from './tablebuilder'
import type {Manager} from '../types'

export function createSchemaTool(manager: Manager) {
  return {
    async initSchema(callback) {
      const gateways = []
      const ctx = {
        table(tableName, callback) {
          const gateway = createTableBuilder(tableName, callback)
          gateways.push(gateway)
          return gateway
        }
      }
      callback(ctx)
      const queries = gateways.map(gateway => gateway.buildOnlyTable())
      const alters = gateways.map(gateway => gateway.buildOnlyAlters()).reduce((target, alters) => ([
        ...target,
        ...alters
      ]), [])
      try {
        await Promise.all(queries.map(line => manager.getPool().execute(line)))
        await Promise.all(alters.map(line => manager.getPool().execute(line)))
        return true
      } catch (err) {
        console.error('There\'s a problem with database init', err)
        throw err
      }
    },
    async useTable(tableName: string, callback: Function) {
      const gateway = useTableBuilder(tableName, callback)
      try {
        await Promise.all(gateway.buildOnlyAlters().map(line => manager.getPool().execute(line)))
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
