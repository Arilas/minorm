import { stub } from 'sinon' // eslint-disable-line
import { ColumnMeta, Relation, Adapter } from '../../../src'

export const fakeRelationResponse: Relation[] = [
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

export const fakeColumnsMeta: ColumnMeta[] = [
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
  const execute = stub()
  function assignDefaultBehavior() {
    execute.callsFake((query, values) => {
      throw new Error(`fake not found ${query} ${values}`)
    })
  }
  assignDefaultBehavior()

  // @ts-ignore
  const executeFormat = qb => {
    const query = qb.toParam()
    return execute(query.text, query.values)
  }

  const pool: Adapter = {
    init: () => undefined,
    end: stub().returns(Promise.resolve()),
    getColumns() {
      return Promise.resolve(fakeColumnsMeta)
    },
    getRelations() {
      return Promise.resolve(fakeRelationResponse)
    },
    query: executeFormat,
    execute: executeFormat,
    _execute: options => execute(options.sql, options.values),
  }

  function inject() {}

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
