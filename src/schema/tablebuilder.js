/** @flow */
import {createColumnContext} from './createColumnContext'
import type {SchemaToolCreateTableContext, SchemaToolGateway} from './types'

function createTableContext(ctx, isNew: boolean = true): SchemaToolCreateTableContext {
  if (!ctx) {
    throw new Error('Gateway API must be specified')
  }
  const addLine = isNew ? ctx.addLine : ctx.addAlter
  const removeAlter = ctx.removeAlter
  const addAlter = ctx.addAlter
  return {
    column(columnName) {
      const column = createColumnContext(columnName)
      addLine(column)
      return column
    },
    id() {
      return this.column('id').int().unsigned().primary().autoIncrement()
    },
    createdAndModified() {
      this.column('createdAt').dateTime()
      return this.column('modifiedAt').dateTime()
    },
    dropColumn(columnName: string) {
      return removeAlter(`COLUMN \`${columnName}\``)
    },
    dropIndex(indexName: string) {
      return removeAlter(`INDEX \`${indexName}\``)
    },
    dropRef(foreignKey: string) {
      return removeAlter(`FOREIGN KEY \`${foreignKey}\``)
    },
    ref(columnName: string, referencedTableName: string, referencedColumnName: string, indexName = null) {
      if (!indexName) {
        indexName = `FK_${columnName}`
      }
      addAlter(`CONSTRAINT \`${indexName}\` FOREIGN KEY (\`${columnName}\`) REFERENCES \`${referencedTableName}\` (\`${referencedColumnName}\`)`)
    },
    unique(columnName, indexName = null) {
      if (!indexName) {
        indexName = 'IDX_' + columnName
      }
      addLine(`UNIQUE KEY \`${indexName}\` (\`${columnName}\`)`)
    },
    index(columnName, indexName = null) {
      if (!indexName) {
        indexName = 'IDX_' + columnName
      }
      addLine(`INDEX \`${indexName}\` (\`${columnName}\`)`)
    },
    key(columnName, indexName = null) {
      if (!indexName) {
        indexName = 'IDX_' + columnName
      }
      addLine(`KEY \`${indexName}\` (\`${columnName}\`)`)
    }
  }
}

export function createTableGateway(tableName: string): SchemaToolGateway {
  const lines = []
  const alters = []
  const removeAlters = []
  const api = {
    addLine(line) {
      lines.push(line)
      return line
    },
    addAlter(line) {
      alters.push(line)
      return line
    },
    removeAlter(line) {
      removeAlters.push(line)
      return line
    }
  }
  return {
    getApi() {
      return api
    },
    build() {
      const blocks = [
        `CREATE TABLE IF NOT EXISTS \`${tableName}\` (`,
        lines.map(line => line.toString()).join(',\n') + (alters.length > 0 ? ',' : ''),
        alters.map(line => line.toString()).join(',\n'),
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;'
      ]
      return blocks.join('\n')
    },
    getQuery() {
      if (!lines.length) {
        return null
      }
      const blocks = [
        `CREATE TABLE IF NOT EXISTS \`${tableName}\` (`,
        lines.map(line => line.toString()).join(',\n'),
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;'
      ]
      return blocks.join('\n')
    },
    getAlters() {
      return [
        ...alters.map(line => `ALTER TABLE ${tableName} ADD ${line.toString()}`),
        ...removeAlters.map(line => `ALTER TABLE ${tableName} DROP ${line.toString()}`)
      ]
    }
  }
}

export function createTableBuilder(tableName: string, callback: Function) {
  const wrapper = createTableGateway(tableName)
  callback(createTableContext(wrapper.getApi()))
  return wrapper
}

export function useTableBuilder(tableName: string, callback: Function) {
  const wrapper = createTableGateway(tableName)
  callback(createTableContext(wrapper.getApi(), false))
  return wrapper
}
