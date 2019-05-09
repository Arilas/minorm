import { createMigrationManager } from './createMigrationManager'
import initMinormMigration from './initMinormSchema'
import { SchemaTool } from './types'
import { Manager } from '../createManager'

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
    },
  }
}
