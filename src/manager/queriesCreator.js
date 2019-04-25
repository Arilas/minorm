/** @flow strict */
import { deprecate } from '../utils/deprecation'
import type { QueryBuilder, ParamString } from 'squel'
import type { QueryResult, QueryOptions } from '../connectionManager'
import type { ManagerConstructor } from './types'
import type { Connection } from './connectionCreator'

export type Queries = $Exact<{
  ...Connection,
  query(query: QueryBuilder, options?: $Shape<QueryOptions>): QueryResult,
  execute(query: QueryBuilder, options?: $Shape<QueryOptions>): QueryResult,
  nestQuery(query: QueryBuilder, options?: $Shape<QueryOptions>): QueryResult,
}>

export function queriesCreator<T: Connection>(
  next: ManagerConstructor<T>,
): ManagerConstructor<
  $Exact<{
    ...T,
    ...Queries,
  }>,
> {
  return connectionConfig => {
    const manager = next(connectionConfig)

    /**
    This helper is checking that provided query is instance of QueryBuilder or at least provide API to receive sql and values
     */
    const checkForQueryBuilder = (query: QueryBuilder) => {
      if (typeof query.toParam !== 'function') {
        throw new Error('Query Builder instance required')
      }
    }

    /**
    This helper is used to catch call stack before we start executing query.
    This is useful when developer needs to understand which query and which code triggered execution of some problem query.
    By default Error stack doesn't contains original call stack but only node timers and internal mysql2 call stack which is not so useful
     */
    const makeCatcher = (sql: string, stack: string) => err => {
      const newErr = new Error(`${err.message}
  Query: ${sql}
  Call stack for query: ${stack}
  `)
      throw newErr
    }

    /**
    This method of querying information make escaping of query before sending to database.
    It's fast, it's safe, but it's not uses prepare statement, so there's possible some cases in future about this.
     */
    function query(
      query: QueryBuilder,
      options?: $Shape<QueryOptions>,
    ): QueryResult {
      checkForQueryBuilder(query)
      const { stack } = new Error()
      const paramString: ParamString = query.toParam()
      return manager
        .getPool()
        .query({
          ...(options || {}),
          sql: paramString.text,
          values: paramString.values,
        })
        .catch(makeCatcher(paramString.text, stack))
    }

    /**
    This method of querying information uses prepare-statement, so it's safe from SQL-Injections if you you map your values
     */
    function execute(
      query: QueryBuilder,
      options?: $Shape<QueryOptions>,
    ): QueryResult {
      checkForQueryBuilder(query)
      const { stack } = new Error()
      const paramString: ParamString = query.toParam()
      return manager
        .getPool()
        .execute({
          ...(options || {}),
          sql: paramString.text,
          values: paramString.values,
        })
        .catch(makeCatcher(paramString.text, stack))
    }

    /**
    This method is used to query information with flag nestTables enabled by default. Please consider usage:
    `query.getMapper().fetch()` or `query.execute(true)`(which is the same as this query) or
    `manager.execute(query, { nestTables:tru })`
    @deprecated
     */
    function nestQuery(
      query: QueryBuilder,
      options?: $Shape<QueryOptions>,
    ): QueryResult {
      deprecate(
        'Manager.nestQuery() is deprecated. Please use QueryBuilder.getMapper().fetch() or QueryBuilder.execute(true) or even manager.execute(queryBuilder, { nestTables: true })',
      )
      checkForQueryBuilder(query)
      const { stack } = new Error()
      const paramString: ParamString = query.toParam()
      return manager
        .getPool()
        .execute({
          ...(options || {}),
          nestTables: true,
          sql: paramString.text,
          values: paramString.values,
        })
        .catch(makeCatcher(paramString.text, stack))
    }

    return {
      ...manager,
      query,
      execute,
      nestQuery,
    }
  }
}
