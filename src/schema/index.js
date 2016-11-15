import {createTableBuilder} from './tablebuilder'
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
      const queries = gateways.map(gateway => gateway.build())
      try {
        do {
          const query = queries.shift()
          await manager.getPool().execute(query)
        } while(queries.length)
        return true
      } catch (err) {
        console.error('There\'s a problem with database init', err)
        throw err
      }
    }
  }
}
