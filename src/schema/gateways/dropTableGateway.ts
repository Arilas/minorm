import { createBaseGateway } from './createBaseGateway'
import { SchemaToolGateway } from '../types'

export function dropTableGateway(): (tableName: string) => SchemaToolGateway {
  return tableName => ({
    ...createBaseGateway(),
    getDropQueries() {
      return [`DROP TABLE ${tableName}`]
    },
  })
}
