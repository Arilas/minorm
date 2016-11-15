/** @flow */
import {createColumnBuilder} from './columnbuilder'
import type {Manager} from '../types'

function createTableGateway(ctx) {
  return {
    column(columnName) {
      return ctx.addLine(createColumnBuilder(columnName))
    },
    ref(columnName: string, referencedTableName: string, referencedColumnName: string) {

    } 
  }
}

export function createTableBuilder(manager: Manager) {
  return (tableName, callback) => {
    const lines = []
    const api = {
      addLine(line) {
        lines.push(line)
        return line
      }
    }
    callback(createTableGateway(api))
    return lines
  }
}
