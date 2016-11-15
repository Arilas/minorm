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
        await manager.getPool().execute(queries.join(';\n'))
        return true
      } catch (err) {
        console.error('There\'s a problem with database init', err)
        throw err
      }
    }
  }
}
