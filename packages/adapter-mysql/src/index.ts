import { createPool, Pool, PoolOptions } from 'mysql2/promise'
import { Adapter } from '@minorm/core'
import { getColumns as getColumnsExecute } from './getColumns'
import { getRelations as getRelationsExecute } from './getRelations'
import { QueryBuilder, ParamString } from 'squel'
import { QueryOptions, RowDataPacket, OkPacket } from '@minorm/core/lib/types'

export function createAdapter(configuration: PoolOptions): Adapter {
  let pool: Pool | null = null

  function init() {
    pool = createPool(configuration)
  }

  /**
    This helper is checking that provided query is instance of QueryBuilder or at least provide API to receive sql and values
     */
  const checkForQueryBuilder = (query: QueryBuilder) => {
    if (!query || typeof query.toParam !== 'function') {
      throw new Error('Query Builder instance required')
    }
  }

  /**
    This method of querying information make escaping of query before sending to database.
    It's fast, it's safe, but it's not uses prepare statement, so there's possible some cases in future about this.
     */
  async function query(
    query: QueryBuilder,
    options?: Partial<QueryOptions>,
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<[RowDataPacket[][] | RowDataPacket[] | OkPacket, any]> {
    checkForQueryBuilder(query)
    const { stack } = new Error()
    const paramString: ParamString = query.toParam()
    if (!pool) {
      throw new Error('Pool is closed.')
    }
    try {
      return await pool.query({
        ...(options || {}),
        sql: paramString.text,
        values: paramString.values,
      })
    } catch (err) {
      const newErr = {
        ...err,
        message: `${err.message}
Query: ${paramString.text}
Call stack for query: ${stack}`,
        stack,
      }
      throw newErr
    }
  }

  async function _execute<
    T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[]
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
  >(options: QueryOptions): Promise<[T, any]> {
    const { stack } = new Error()
    if (!pool) {
      throw new Error('Pool is closed.')
    }
    try {
      return await pool.execute(options)
    } catch (err) {
      const newErr = {
        ...err,
        message: `${err.message}
Query: ${options.sql}
Call stack for query: ${stack}`,
        stack,
      }
      throw newErr
    }
  }

  /**
  This method of querying information uses prepare-statement, so it's safe from SQL-Injections if you you map your values
   */
  async function execute(
    query: QueryBuilder,
    options?: Partial<QueryOptions>,
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<[RowDataPacket[][] | RowDataPacket[] | OkPacket, any]> {
    checkForQueryBuilder(query)
    const { stack } = new Error()
    const paramString: ParamString = query.toParam()
    if (!pool) {
      throw new Error('Pool is closed.')
    }
    try {
      return await pool.execute({
        ...(options || {}),
        sql: paramString.text,
        values: paramString.values,
      })
    } catch (err) {
      const newErr = {
        ...err,
        message: `${err.message}
Query: ${paramString.text}
Call stack for query: ${stack}`,
        stack,
      }
      throw newErr
    }
  }

  function getColumns() {
    if (!pool) {
      throw new Error('Pool is closed.')
    }
    return getColumnsExecute(pool, configuration.database)
  }

  function getRelations() {
    if (!pool) {
      throw new Error('Pool is closed.')
    }
    return getRelationsExecute(pool, configuration.database)
  }

  async function end() {
    if (pool) {
      await pool.end()
      pool = null
    }
  }

  return {
    init,
    query,
    execute,
    _execute,
    getColumns,
    getRelations,
    end,
  }
}
