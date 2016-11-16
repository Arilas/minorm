/** @flow */
import {useTableBuilder} from './tablebuilder'
import {MINORM_MIGRATIONS_TABLE} from './constants'
import {createSchemaToolContext} from './createSchemaToolContext'
import {createMigrationManager} from './createMigrationManager'
import initMinormMigration from './initMinormSchema'
import type {SchemaTool} from './types'
import type {Manager} from '../types'

export function createSchemaTool(manager: Manager): SchemaTool {
  const migrationManager = createMigrationManager(manager)
  migrationManager.addInitializer('minorm', initMinormMigration)
  return {
    setSchemaInit(handler) {
      migrationManager.addInitializer('user', handler)
    },
    initSchema() {
      return migrationManager.apply()
    },
    dropSchema() {
      return migrationManager.revertAll()
    },
    getMigrationManager() {
      return migrationManager
    }
  }
}
