/** @flow */
import isGenerator from 'is-generator-function'
import {createMigrationContext} from './createMigrationContext'
import {MINORM_MIGRATIONS_TABLE} from './constants'
import type {MigrationManager, Migration} from './types'
import type {Manager} from '../types'

const MIGRATIONS_QUERY = `SELECT migration FROM ${MINORM_MIGRATIONS_TABLE}`

type MigrationsMap = Map<string, Migration>

export function createMigrationManager(manager: Manager): MigrationManager {
  const initializers:MigrationsMap = new Map()
  const migrations: MigrationsMap = new Map()

  return {
    addInitializer(name, handler) {
      initializers.set(name, handler)
    },
    addMigration(name, handler) {
      migrations.set(name, handler)
    },
    async apply() {
      await manager.ready()
      if (!manager.getMetadataManager().hasTable(MINORM_MIGRATIONS_TABLE)) {
        await this.execute(initializers, 'up')
      }
      const migrationsToExecute = await this.getMigrationsToExecute()
      if (migrationsToExecute.size > 0) {
        await this.execute(migrationsToExecute, 'up')
      }
      return true
    },
    async revertAll() {
      await manager.ready()
      const migrationsToRevert = new Map(
        Array.from(migrations.keys())
        .sort()
        .reverse()
        .map(migration => [migration, migrations.get(migration)])
      )
      await this.execute(migrationsToRevert, 'down')
      await this.execute(initializers, 'down')
      return true
    },
    async execute(migrations, method) {
      const MigrationsRepo = manager.getRepository(MINORM_MIGRATIONS_TABLE)
      for(const [key, handler] of migrations) {
        const {
          context,
          resetQueries,
          getPreQueries,
          getAddQueries,
          getDropQueries,
          getAddAlters,
          getDropAlters,
          getPostQueries
        } = createMigrationContext(manager.getMetadataManager())
        if (isGenerator(handler[method])) {
          for (const gateway of handler[method](context)) {
            if (!gateway || !gateway.type) {
              continue
            }
            const action = gateway.getAction()
            if (action.type === 'APPLY') {
              await Promise.all(getPreQueries().map(line => manager.getPool().execute(line)))
              await Promise.all(getDropAlters().map(line => manager.getPool().execute(line)))
              // Because some of people don't drop foreign keys before and order is matter
              for(const line of getDropQueries()) {
                await manager.getPool().execute(line)
              }
              await Promise.all(getAddQueries().map(line => manager.getPool().execute(line)))
              await Promise.all(getAddAlters().map(line => manager.getPool().execute(line)))
              await Promise.all(getPostQueries().map(line => manager.getPool().execute(line)))
              manager.clear()
              manager.connect()
              await manager.ready()

              resetQueries()
            }
          }
        } else {
          handler[method](context)
          await Promise.all(getPreQueries().map(line => manager.getPool().execute(line)))
          await Promise.all(getDropAlters().map(line => manager.getPool().execute(line)))
          // Because some of people don't drop foreign keys before and order is matter
          for(const line of getDropQueries()) {
            await manager.getPool().execute(line)
          }
          await Promise.all(getAddQueries().map(line => manager.getPool().execute(line)))
          await Promise.all(getAddAlters().map(line => manager.getPool().execute(line)))
          await Promise.all(getPostQueries().map(line => manager.getPool().execute(line)))
          manager.clear()
          manager.connect()
          await manager.ready()  
        }
        if (method === 'up') {
          const date = new Date
          const formattedDate = `${date.getFullYear()}-${date.getUTCMonth()}-${date.getDate()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`
          await MigrationsRepo.create({
            migration: key,
            createdAt: formattedDate,
            modifiedAt: formattedDate
          }).save()
        } else {
          try {
            const migration = await MigrationsRepo.findOneBy({
              migration: key
            })
            if (migration) {
              await migration.remove()
            }
          } catch(err) {
            // Everything good. We just removed migrations table :)
          }
        }
      }
      return true
    },
    async getMigrationsToExecute(): Promise<MigrationsMap> {
      const [result] = await manager.getPool().query(MIGRATIONS_QUERY)
      const appliedMigrations = result.reduce((target, row) => ({
        ...target,
        [row.migration]: true
      }), {})

      return new Map(
        Array.from(migrations.keys())
        .filter(migration => !appliedMigrations.hasOwnProperty(migration))
        .sort()
        // $FlowIgnore fix for model
        .map(migration => [migration, migrations.get(migration)])
      )
    }
  }
}
