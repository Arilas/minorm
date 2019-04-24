/** @flow */
import type { PoolOptions } from '../connectionManager'

export type ManagerConstructor<T> = (connectionConfig: PoolOptions) => T
