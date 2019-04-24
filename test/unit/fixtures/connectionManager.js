/** @flow */
import { type QueryOptions } from 'mysql2'
import { type Connection, type QueryResult } from 'mysql2/promise'

import { setProvider, type Pool } from '../../../src/connectionManager'
import {
  TABLE_COLUMNS_META_QUERY,
  TABLE_RELATION_META_QUERY,
} from '../../../src/utils/createMetadataManager'

export function createFakePool() {
  const fakeData: {
    [key: string]:
      | Array<*>
      | {
          insertId?: string | number,
          affectedRows?: number,
          changedRows?: number,
        },
  } = {
    [TABLE_COLUMNS_META_QUERY]: [
      {
        tableName: 'users',
        columnName: 'id',
      },
      {
        tableName: 'users',
        columnName: 'createdAt',
      },
      {
        tableName: 'users',
        columnName: 'modifiedAt',
      },
      {
        tableName: 'posts',
        columnName: 'id',
      },
      {
        tableName: 'posts',
        columnName: 'createdAt',
      },
      {
        tableName: 'posts',
        columnName: 'modifiedAt',
      },
      {
        tableName: 'posts',
        columnName: 'title',
      },
      {
        tableName: 'posts',
        columnName: 'body',
      },
      {
        tableName: 'posts',
        columnName: 'creator_id',
      },
      {
        tableName: 'comments',
        columnName: 'id',
      },
      {
        tableName: 'comments',
        columnName: 'createdAt',
      },
      {
        tableName: 'comments',
        columnName: 'modifiedAt',
      },
      {
        tableName: 'comments',
        columnName: 'creator_id',
      },
      {
        tableName: 'comments',
        columnName: 'post_id',
      },
      {
        tableName: 'comments',
        columnName: 'body',
      },
    ],
    [TABLE_RELATION_META_QUERY]: [
      {
        tableName: 'posts',
        columnName: 'creator_id',
        referencedTableName: 'users',
        referencedColumnName: 'id',
      },
      {
        tableName: 'comments',
        columnName: 'creator_id',
        referencedTableName: 'users',
        referencedColumnName: 'id',
      },
      {
        tableName: 'comments',
        columnName: 'post_id',
        referencedTableName: 'posts',
        referencedColumnName: 'id',
      },
    ],
  }
  function execute(query): QueryResult {
    if (fakeData[query.sql]) {
      // $FlowIgnore
      return Promise.resolve([fakeData[query.sql], undefined])
    }
    throw new Error(`fake not found ${query.sql}`)
  }

  // $FlowIgnore
  const fakeConnection: Connection = {
    query: (sql: QueryOptions) => execute(sql),
    execute: (sql: QueryOptions) => execute(sql),
  }

  const pool = {
    getConnection: () => Promise.resolve(fakeConnection),
    end: () => Promise.resolve(),
    query: (sql: QueryOptions, values?: Array<mixed>) =>
      fakeConnection.query(sql, values),
    execute: (sql: QueryOptions, values?: Array<mixed>) =>
      fakeConnection.execute(sql, values),
  }

  function fakeMySqlProvider(): Pool {
    return pool
  }
  function inject() {
    setProvider(fakeMySqlProvider)
  }

  function setAnswer(
    sql: string,
    result:
      | Array<*>
      | {
          insertId?: string | number,
          affectedRows?: number,
          changedRows?: number,
        },
  ) {
    fakeData[sql] = result
  }

  return {
    pool,
    inject,
    setAnswer,
  }
}
