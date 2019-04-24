/** @flow strict */
import { type PoolOptions, type QueryOptions } from 'mysql2'
import MySQL, {
  type Pool as MySQLPool,
  type Connection,
  type QueryResult,
} from 'mysql2/promise'

let connectionProvider = mySQLCreatePool

export type Pool = {
  getConnection(): Promise<Connection>,
  end(): Promise<void>,
  query(sql: QueryOptions, values?: Array<mixed>): QueryResult,
  execute(sql: QueryOptions, values?: Array<mixed>): QueryResult,
}

export type { Connection, QueryResult, QueryOptions, PoolOptions }

export function mySQLCreatePool(connectionConfig: PoolOptions): MySQLPool {
  return MySQL.createPool(connectionConfig)
}

export function connect(connectionConfig: PoolOptions): Pool {
  return connectionProvider(connectionConfig)
}

export function setProvider(provider: typeof connect) {
  connectionProvider = provider
}

export function resetProvider() {
  connectionProvider = mySQLCreatePool
}
