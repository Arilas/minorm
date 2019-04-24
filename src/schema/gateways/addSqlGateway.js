/** @flow strict */
import { createBaseGateway } from './createBaseGateway'
import type { SchemaToolGateway } from '../types'

export function addSqlGateway(): (sql: string) => SchemaToolGateway {
  return sql => ({
    ...createBaseGateway(),
    getPostQueries() {
      return [sql]
    },
  })
}
