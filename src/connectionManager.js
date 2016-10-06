/** @flow */
import MySQL from 'mysql2/promise'

let connectionProvider = mySQLCreatePool

export function mySQLCreatePool(connectionConfig: any) {
  return MySQL.createPool(connectionConfig)
}

export function connect(connectionConfig: any) {
  return connectionProvider(connectionConfig)
}

export function setProvider(provider: Function) {
  connectionProvider = provider
}

export function resetProvider() {
  connectionProvider = mySQLCreatePool
}
