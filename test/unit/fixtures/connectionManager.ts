import sinon from 'sinon'
import { Connection } from 'mysql2/promise'

import { setProvider, Pool } from '../../../src/connectionManager'
import {
  TABLE_COLUMNS_META_QUERY,
  TABLE_RELATION_META_QUERY,
} from '../../../src/utils/createMetadataManager'

export const fakeRelationResponse = [
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
]

export const fakeColumnsMeta = [
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
]

export function createFakePool() {
  const execute = sinon.stub()
  function assignDefaultBehavior() {
    execute
      .withArgs(TABLE_RELATION_META_QUERY)
      .returns(Promise.resolve([fakeRelationResponse]))
    execute
      .withArgs(TABLE_COLUMNS_META_QUERY)
      .returns(Promise.resolve([fakeColumnsMeta]))
    execute.callsFake((query, values) => {
      throw new Error(`fake not found ${query} ${values}`)
    })
  }
  assignDefaultBehavior()

  // @ts-ignore
  const executeFormat = query => execute(query.sql, query.values)

  // @ts-ignore
  const fakeConnection: Connection = {
    query: executeFormat,
    execute: executeFormat,
  }

  const pool = {
    getConnection: () => Promise.resolve(fakeConnection),
    end: sinon.stub().returns(Promise.resolve()),
    query: executeFormat,
    execute: executeFormat,
  }

  function fakeMySqlProvider(): Pool {
    return pool
  }
  function inject() {
    // @ts-ignore
    setProvider(fakeMySqlProvider)
  }

  // eslint-disable-next-line
  function setAnswer(sql: string, val: any, resp?: any) {
    if (resp === undefined) {
      execute.withArgs(sql).returns(Promise.resolve([val]))
    } else {
      execute.withArgs(sql, val).returns(Promise.resolve([resp]))
    }
  }

  function resetAnswers() {
    execute.resetBehavior()
    assignDefaultBehavior()
  }

  return {
    pool,
    inject,
    setAnswer,
    resetAnswers,
    executeStub: execute,
  }
}
