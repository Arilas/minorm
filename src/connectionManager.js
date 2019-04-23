/** @flow */
import { type PoolOptions } from 'mysql2'
import MySQL, { type Pool } from 'mysql2/promise'

let connectionProvider = mySQLCreatePool

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
