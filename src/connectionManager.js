/** @flow */
import { type PoolOptions, type QueryOptions } from 'mysql2'
import MySQL, {
  type Pool,
  type Connection,
  type QueryResult,
} from 'mysql2/promise'

let connectionProvider = mySQLCreatePool

export type { Pool, Connection, QueryResult, QueryOptions, PoolOptions }

export function mySQLCreatePool(connectionConfig: PoolOptions): Pool {
  return MySQL.createPool(connectionConfig)
}

export function connect(connectionConfig: PoolOptions): Pool {
  return connectionProvider(connectionConfig)
}

export function setProvider(provider: Function) {
  connectionProvider = provider
}

export function resetProvider() {
  connectionProvider = mySQLCreatePool
}
