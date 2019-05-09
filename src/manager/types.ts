import { PoolOptions } from '../connectionManager'

export interface ManagerBase {
  clear?: () => Promise<void>
  ready?: () => Promise<void>
}

export type ManagerConstructor<T> = (connectionConfig: PoolOptions) => T
