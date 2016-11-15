/** @flow */
import {createColumnBuilder} from './columnbuilder'

function createTableGateway(ctx) {
  return {
    column(columnName) {
      return ctx.addLine(createColumnBuilder(columnName))
    },
    ref(columnName: string, referencedTableName: string, referencedColumnName: string, indexName = null) {
      if (!indexName) {
        indexName = `FK_${columnName}`
      }
      ctx.addLine(`CONSTRAINT \`${indexName}\` FOREIGN KEY (\`${columnName}\`) REFERENCES \`${referencedTableName}\` (\`${referencedColumnName}\`)`)
    },
    unique(columnName, indexName = null) {
      if (!indexName) {
        indexName = 'IDX_' + columnName
      }
      ctx.addLine(`UNIQUE KEY \`${indexName}\` (\`${columnName}\`)`)
    },
    index(columnName, indexName = null) {
      if (!indexName) {
        indexName = 'IDX_' + columnName
      }
      ctx.addLine(`INDEX \`${indexName}\` (\`${columnName}\`)`)
    },
    key(columnName, indexName = null) {
      if (!indexName) {
        indexName = 'IDX_' + columnName
      }
      ctx.addLine(`KEY \`${indexName}\` (\`${columnName}\`)`)
    }
  }
}

export function createTableBuilder(tableName: string, callback: Function) {
  const lines = []
  const api = {
    addLine(line) {
      lines.push(line)
      return line
    }
  }
  callback(createTableGateway(api))
  return {
    build() {
      const blocks = [
        `CREATE TABLE IF NOT EXISTS \`${tableName}\` (`,
        lines.map(line => line.toString()).join(',\n'),
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;'
      ]
      return blocks.join('\n')
    }
  }
}
