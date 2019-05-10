import { createPool, PoolOptions } from 'mysql2/promise'
import { Adapter } from '@minorm/core'
import { getColumns } from './getColumns'
import { getRelations } from './getRelations'

export function createAdapter(configuration: PoolOptions): Adapter {
  // @ts-ignore
  const pool: Adapter = createPool(configuration)
  pool.getColumns = () => getColumns(pool, configuration.database)
  pool.getRelations = () => getRelations(pool, configuration.database)

  return pool
}
