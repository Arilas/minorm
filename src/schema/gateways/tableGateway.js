/** @flow */
import { createBaseGateway } from './createBaseGateway'
import type {SchemaToolGateway, SchemaToolCreateTableContext} from '../types'
import type {MetadataManager} from '../../types'
import {createColumnContext} from './table/createColumnContext'

function createTableContext(ctx, metadataManager, tableName: string): SchemaToolCreateTableContext {
  if (!ctx) {
    throw new Error('Gateway API must be specified')
  }
  const lineAdd = ctx.lineAdd
  const alterDrop = ctx.alterDrop
  const alterAdd = ctx.alterAdd
  const lineDrop = ctx.lineDrop
  return {
    column(columnName) {
      const column = createColumnContext(columnName, metadataManager, tableName)
      lineAdd(column)
      return column
    },
    id() {
      return this.column('id').int().unsigned().primary().autoIncrement()
    },
    refColumn(columnName, targetTableName, targetColumnName = 'id') {
      this.ref(columnName, targetTableName, targetColumnName)
      return this.column(columnName).int().unsigned()
    },
    createdAndModified() {
      this.column('createdAt').dateTime()
      return this.column('modifiedAt').dateTime()
    },
    dropColumn(columnName: string) {
      alterDrop(`COLUMN \`${columnName}\``)
    },
    dropIndex(indexName: string) {
      lineDrop(`DROP INDEX \`${indexName}\` ON \`${tableName}\``)
    },
    dropRef(indexName: string) {
      alterDrop(`FOREIGN KEY \`${indexName}\``)
    },
    dropColumnRef(columnName: string) {
      alterDrop(`FOREIGN KEY \`FK_${tableName}_${columnName}\``)
    },
    dropColumnUnique(columnName: string) {
      lineDrop(`DROP INDEX \`UNI_${tableName}_${columnName}\` ON \`${tableName}\``)
    },
    dropColumnIndex(columnName: string) {
      lineDrop(`DROP INDEX \`IDX_${tableName}_${columnName}\` ON \`${tableName}\``)
    },
    dropColumnKey(columnName: string) {
      lineDrop(`DROP INDEX \`KEY_${tableName}_${columnName}\` ON \`${tableName}\``)
    },
    ref(columnName: string, referencedTableName: string, referencedColumnName: string, indexName = null) {
      if (!indexName) {
        indexName = `FK_${tableName}_${columnName}`
      }
      alterAdd(`CONSTRAINT \`${indexName}\` FOREIGN KEY (\`${columnName}\`) REFERENCES \`${referencedTableName}\` (\`${referencedColumnName}\`)`)
    },
    unique(columnName, indexName = null) {
      if (!indexName) {
        indexName = `UNI_${tableName}_${columnName}`
      }
      lineAdd(`UNIQUE KEY \`${indexName}\` (\`${columnName}\`)`)
    },
    index(columnName, indexName = null) {
      if (!indexName) {
        indexName = `IDX_${tableName}_${columnName}`
      }
      lineAdd(`INDEX \`${indexName}\` (\`${columnName}\`)`)
    },
    key(columnName, indexName = null) {
      if (!indexName) {
        indexName = `KEY_${tableName}_${columnName}`
      }
      lineAdd(`KEY \`${indexName}\` (\`${columnName}\`)`)
    }
  }
}

export function createTableGateway(metadataManager: MetadataManager, tableName: string): SchemaToolGateway {
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
    ...createBaseGateway(),
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
    getAddQueries() {
      if (metadataManager.hasTable(tableName)) {
        return []
      }
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
    getDropQueries() {
      return parts.lines.drop.map(line => line.toString())
    },
    getAddAlterQueries() {
      return [
        ...(metadataManager.hasTable(tableName) 
          ? parts.lines.add.map(line => `ALTER TABLE ${tableName} ADD ${line.toString()}`)
          : []
        ),
        ...parts.alters.add.map(line => `ALTER TABLE ${tableName} ADD ${line.toString()}`)
      ]
    },
    getDropAlterQueries() {
      return parts.alters.drop.map(line => `ALTER TABLE ${tableName} DROP ${line.toString()}`)
    }
  }
}

export function createTableBuilder(tableName: string, callback: Function, isNew: boolean = true) {
  // $FlowIgnore
  return tableGateway(({hasTable: () => !isNew}))(tableName, callback)
}

export function tableGateway(metadataManager: MetadataManager): (tableName: string, callback: Function) => SchemaToolGateway {
  return (tableName, callback) => {
    const wrapper = createTableGateway(metadataManager, tableName)
    callback(createTableContext(wrapper.getApi(), metadataManager, tableName))
    return wrapper
  }
}