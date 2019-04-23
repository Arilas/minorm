/** @flow */
import type { MetadataManager } from '../../../src/types'

function createType(type) {
  return (name, tableName) => ({
    tableName,
    dataType: type,
    isNullable: 0,
    dataLength: 0,
    columnName: name,
  })
}
const col = createType('VARCHAR')
const cols = {
  int: createType('INT'),
  dateTime: createType('DATETIME'),
  text: createType('LONGTEXT'),
}

export function createMetadataManager(): MetadataManager {
  const dbSchema = {
    users: {
      columns: {
        id: cols.int('id', 'users'),
        createdAt: cols.dateTime('createdAt', 'users'),
        modifiedAt: cols.dateTime('modifiedAt', 'users'),
        login: col('login', 'users'),
        password: col('password', 'users'),
      },
      relations: {},
    },
    posts: {
      columns: {
        id: cols.int('id', 'posts'),
        createdAt: cols.dateTime('createdAt', 'posts'),
        modifiedAt: cols.dateTime('modifiedAt', 'posts'),
        title: col('title', 'posts'),
        body: cols.text('password', 'posts'),
        creator_id: cols.int('creator_id', 'posts'),
      },
      relations: {
        creator_id: {
          tableName: 'posts',
          columnName: 'creator_id',
          referencedTableName: 'users',
          referencedColumnName: 'id',
        },
      },
    },
    comments: {
      columns: {
        id: cols.int('id', 'comments'),
        createdAt: cols.dateTime('createdAt', 'comments'),
        modifiedAt: cols.dateTime('modifiedAt', 'comments'),
        body: cols.text('password', 'comments'),
        post_id: cols.int('creator_id', 'comments'),
        creator_id: cols.int('creator_id', 'comments'),
      },
      relations: {
        creator_id: {
          tableName: 'comments',
          columnName: 'creator_id',
          referencedTableName: 'users',
          referencedColumnName: 'id',
        },
        post_id: {
          tableName: 'posts',
          columnName: 'post_id',
          referencedTableName: 'posts',
          referencedColumnName: 'id',
        },
      },
    },
  }

  return {
    loadTablesMetadata() {
      return Promise.resolve()
    },
    loadRelationsMetadata() {
      return Promise.resolve()
    },
    initDbSchema() {},
    isLoaded() {
      return true
    },
    ready() {
      return Promise.resolve()
    },
    hasTable(tableName) {
      return dbSchema.hasOwnProperty(tableName)
    },
    getTable(tableName) {
      return dbSchema[tableName]
    },
    hasAssociation(tableName, columnName) {
      return (
        this.hasTable(tableName) &&
        dbSchema[tableName].relations.hasOwnProperty(columnName)
      )
    },
    getColumns(tableName) {
      return this.hasTable(tableName) && dbSchema[tableName].columns
    },

    clear() {},
  }
}
