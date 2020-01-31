import { Adapter } from '../types'

export interface ManagerBase {
  clear?: () => Promise<void>
  ready?: () => Promise<void>
}

export type ManagerConstructor<T extends ManagerBase, A extends Adapter> = (
  adapter: A,
) => T
