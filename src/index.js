/** @flow strict */

import { createManager, type Manager } from './createManager'
import {
  setProvider,
  resetProvider,
  connect,
  type PoolOptions,
} from './connectionManager'
import { createRepository, type Repository } from './createRepository'
import { createSchemaTool } from './schema'

export {
  createManager,
  setProvider,
  resetProvider,
  connect,
  createRepository,
  createSchemaTool,
}

export type { Manager, Repository, PoolOptions }
