import { createPool, PoolOptions } from 'mysql2/promise'
import { Adapter } from '@minorm/core'
import { getColumns } from './getColumns'
import { getRelations } from './getRelations'

export function createAdapter(configuration: PoolOptions): Adapter {
  // @ts-ignore
  let pool: Adapter = createPool(configuration)
  let oldEnd = pool.end.bind(pool)
  pool.getColumns = () => getColumns(pool, configuration.database)
  pool.getRelations = () => getRelations(pool, configuration.database)
  pool.end = async () => {
    await oldEnd()
    // @ts-ignore
    pool = createPool(configuration)
    pool.getColumns = () => getColumns(pool, configuration.database)
    pool.getRelations = () => getRelations(pool, configuration.database)
    oldEnd = pool.end.bind(pool)
  }

  return pool
}
