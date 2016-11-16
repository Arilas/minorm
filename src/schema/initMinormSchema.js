/** @flow */
import type {SchemaToolContext} from './types'

export function initMinormSchema(schemaTool: SchemaToolContext) {
  schemaTool.table('__minorm_migrations', table => {
    table.id()
    table.column('migration').notNull()
    table.createdAndModified()
  })
  schemaTool.table('__minorm_benchmark', table => {
    table.id()
    table.column('query').text()
    table.column('queryHash')
    table.column('minExecutionTime').int()
    table.column('maxExecutionTime').int()
    table.column('executedTimes').int()
    table.column('lastExecuted').date()
    table.createdAndModified()
  })
}

export function dropMinormSchema(schemaTool: SchemaToolContext) {
  schemaTool.dropTable('__minorm_migrations')
  schemaTool.dropTable('__minorm_benchmark')
}