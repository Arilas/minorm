/** @flow */
import {createColumnBuilder} from './columnbuilder'

function createTableGateway(ctx, isNew: boolean = true) {
  const addLine = isNew ? ctx.addLine : ctx.addAlter
  return {
    column(columnName) {
      return addLine(createColumnBuilder(columnName))
    },
    id() {
      return this.column('id').int().unsigned().primary().autoIncrement()
    },
    createdAndModified() {
      this.column('createdAt').date()
      return this.column('modifiedAt').date()
    },
    dropColumn(columnName: string) {
      return ctx.removeAlter(`COLUMN \`${columnName}\``)
    },
    dropIndex(indexName: string) {
      return ctx.removeAlter(`INDEX \`${indexName}\``)
    },
    ref(columnName: string, referencedTableName: string, referencedColumnName: string, indexName = null) {
      if (!indexName) {
        indexName = `FK_${columnName}`
      }
      ctx.addAlter(`CONSTRAINT \`${indexName}\` FOREIGN KEY (\`${columnName}\`) REFERENCES \`${referencedTableName}\` (\`${referencedColumnName}\`)`)
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

export function createTableWrapper(tableName: string) {
  const lines = []
  const alters = []
  const removeAlters = []
  const api = {
    addLine(line: string | Object) {
      lines.push(line)
      return line
    },
    addAlter(line: string | Object) {
      alters.push(line)
      return line
    },
    removeAlter(line: string) {
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
    buildOnlyTable() {
      const blocks = [
        `CREATE TABLE IF NOT EXISTS \`${tableName}\` (`,
        lines.map(line => line.toString()).join(',\n'),
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;'
      ]
      return blocks.join('\n')
    },
    buildOnlyAlters() {
      return [
        ...alters.map(line => `ALTER TABLE ${tableName} ADD ${line.toString()}`),
        ...removeAlters.map(line => `ALTER TABLE ${tableName} DROP ${line.toString()}`)
      ]
    }
  }
}

export function createTableBuilder(tableName: string, callback: Function) {
  const wrapper = createTableWrapper(tableName)
  callback(createTableGateway(wrapper.getApi()))
  return wrapper
}

export function useTableBuilder(tableName: string, callback: Function) {
  const wrapper = createTableWrapper(tableName)
  callback(createTableGateway(wrapper.getApi(), false))
  return wrapper
}
