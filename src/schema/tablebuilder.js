/** @flow */
import {createColumnContext} from './createColumnContext'
import type {SchemaToolCreateTableContext, SchemaToolGateway} from './types'

function createTableContext(ctx, isNew: boolean = true): SchemaToolCreateTableContext {
  if (!ctx) {
    throw new Error('Gateway API must be specified')
  }
  const lineAdd = isNew ? ctx.lineAdd : ctx.alterAdd
  const alterDrop = ctx.alterDrop
  const alterAdd = ctx.alterAdd
  return {
    column(columnName) {
      const column = createColumnContext(columnName, isNew)
      lineAdd(column)
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
      alterDrop(`COLUMN \`${columnName}\``)
    },
    dropIndex(indexName: string) {
      alterDrop(`INDEX \`${indexName}\``)
    },
    dropRef(foreignKey: string) {
      alterDrop(`FOREIGN KEY \`${foreignKey}\``)
    },
    ref(columnName: string, referencedTableName: string, referencedColumnName: string, indexName = null) {
      if (!indexName) {
        indexName = `FK_${columnName}`
      }
      alterAdd(`CONSTRAINT \`${indexName}\` FOREIGN KEY (\`${columnName}\`) REFERENCES \`${referencedTableName}\` (\`${referencedColumnName}\`)`)
    },
    unique(columnName, indexName = null) {
      if (!indexName) {
        indexName = 'IDX_' + columnName
      }
      lineAdd(`UNIQUE KEY \`${indexName}\` (\`${columnName}\`)`)
    },
    index(columnName, indexName = null) {
      if (!indexName) {
        indexName = 'IDX_' + columnName
      }
      lineAdd(`INDEX \`${indexName}\` (\`${columnName}\`)`)
    },
    key(columnName, indexName = null) {
      if (!indexName) {
        indexName = 'IDX_' + columnName
      }
      lineAdd(`KEY \`${indexName}\` (\`${columnName}\`)`)
    }
  }
}

export function createTableGateway(tableName: string): SchemaToolGateway {
  const parts = {
    lines: {
      add: [],
      drop: []
    },
    alters: {
      add: [],
      drop: []
    }
  }
  const api = {
    lineAdd(line) {
      parts.lines.add.push(line)
    },
    lineDrop(line) {
      parts.lines.drop.push(line)
    },
    alterAdd(line) {
      parts.alters.add.push(line)
    },
    alterDrop(line) {
      parts.alters.drop.push(line)
    }
  }
  return {
    getApi() {
      return api
    },
    build() {
      const blocks = [
        `CREATE TABLE IF NOT EXISTS \`${tableName}\` (`,
        parts.lines.add.map(line => line.toString()).join(',\n') + (parts.alters.add.length > 0 ? ',' : ''),
        parts.alters.add.map(line => line.toString()).join(',\n'),
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;'
      ]
      return blocks.join('\n')
    },
    getAddQuery() {
      if (!parts.lines.add.length) {
        return []
      }
      const blocks = [
        `CREATE TABLE IF NOT EXISTS \`${tableName}\` (`,
        parts.lines.add.map(line => line.toString()).join(',\n'),
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;'
      ]
      return [
        blocks.join('\n')
      ]
    },
    getDropQuery() {
      return parts.lines.drop.map(line => line.toString())
    },
    getAddAlters() {
      return parts.alters.add.map(line => `ALTER TABLE ${tableName} ADD ${line.toString()}`)
    },
    getDropAlters() {
      return parts.alters.drop.map(line => `ALTER TABLE ${tableName} DROP ${line.toString()}`)
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
