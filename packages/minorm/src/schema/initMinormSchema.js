/** @flow */
import {MINORM_BENCHMARK_TABLE, MINORM_MIGRATIONS_TABLE} from './constants'
import type {SchemaToolContext} from './types'

export default {
  up(schemaTool: SchemaToolContext) {
    schemaTool.table(MINORM_MIGRATIONS_TABLE, table => {
      table.id()
      table.column('migration').notNull()
      table.createdAndModified()
    })
    schemaTool.table(MINORM_BENCHMARK_TABLE, table => {
      table.id()
      table.column('query').text()
      table.column('queryHash')
      table.column('minExecutionTime').int()
      table.column('maxExecutionTime').int()
      table.column('executedTimes').int()
      table.column('lastExecuted').date()
      table.createdAndModified()
    })
  },
  down(schemaTool: SchemaToolContext) {
    schemaTool.dropTable(MINORM_MIGRATIONS_TABLE)
    schemaTool.dropTable(MINORM_BENCHMARK_TABLE)
  }
}
