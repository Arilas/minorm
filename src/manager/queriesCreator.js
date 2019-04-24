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
    const checkForQueryBuilder = (query: QueryBuilder) => {
      if (typeof query.toParam !== 'function') {
        throw new Error('Query Builder instance required')
      }
    }
    const makeCatcher = (sql: string, stack: string) => err => {
      const newErr = new Error(`${err.message}
  Query: ${sql}
  Call stack for query: ${stack}
  `)
      throw newErr
    }

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

    function nestQuery(
      query: QueryBuilder,
      options?: $Shape<QueryOptions>,
    ): QueryResult {
      deprecate(
        'Manager.nestQuery() is deprecated. Please use QueryBuilder.getMapper().fetch() or QueryBuilder.execute({nestTables: true})',
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
