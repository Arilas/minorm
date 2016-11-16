/** @flow */
import {createSchemaToolContext} from './createSchemaToolContext'
import {MINORM_MIGRATIONS_TABLE} from './constants'
import type {MigrationManager, Migration} from './types'
import type {Manager} from '../types'

const MIGRATIONS_QUERY = `SELECT migration FROM ${MINORM_MIGRATIONS_TABLE}`

type MigrationsMap = Map<string, Migration>

export function createMigrationManager(manager: Manager): MigrationManager {
  const logger = manager.getLogger()
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
        await this.processInit()
        manager.clear()
        manager.connect()
        await manager.ready()
      }
      const migrationsToExecute = await this.getMigrationsToExecute()
      if (migrationsToExecute.size > 0) {
        await this.processMigrations(migrationsToExecute)
        manager.clear()
        manager.connect()
        await manager.ready()
      }
      return true
    },
    async revertAll() {
      const migrationsToRevert = new Map(
        Array.from(migrations.keys())
        .sort()
        .reverse()
        .map(migration => [migration, migrations.get(migration)])
      )
      await this.revertMigrations(migrationsToRevert)
      await this.revertInit()
      manager.clear()
      manager.connect()
      await manager.ready()
      return true
    },
    async processInit() {
      const {context, getQueries, getAlters} = createSchemaToolContext()
      initializers.forEach(handler => handler.up(context))
      try {
        await Promise.all(getQueries().map(line => manager.getPool().execute(line)))
        await Promise.all(getAlters().map(line => manager.getPool().execute(line)))
        return true
      } catch (err) {
        logger && logger.error('There\'s a problem with database init', err)
        throw err
      }
    },
    async processMigrations(migrations: MigrationsMap) {
      const MigrationsRepo = manager.getRepository(MINORM_MIGRATIONS_TABLE)
      try {
        for (const [key, handler] of migrations) {
          const {context, getQueries, getAlters} = createSchemaToolContext()
          handler.up(context)
          await Promise.all(getQueries().map(line => manager.getPool().execute(line)))
          await Promise.all(getAlters().map(line => manager.getPool().execute(line)))
          const date = new Date
          const formattedDate = `${date.getFullYear()}-${date.getUTCMonth()}-${date.getDate()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`
          await MigrationsRepo.create({
            migration: key,
            createdAt: formattedDate,
            modifiedAt: formattedDate
          }).save()
        }
        return true
      } catch (err) {
        logger && logger.error('There\'s a problem with database init', err)
        throw err
      }
    },
    async revertMigrations(migrations: MigrationsMap) {
      try {
        for (const [key, handler] of migrations) {
          const {context, getQueries, getAlters} = createSchemaToolContext()
          handler.down(context)
          await Promise.all(getAlters().map(line => manager.getPool().execute(line)))
          const queries = getQueries()
          if (queries.length) {
            do {
              const query = queries.shift()
              await manager.getPool().execute(query)
            } while (queries.length)
          }
        }
        return true
      } catch (err) {
        logger && logger.error('There\'s a problem with database init', err)
        throw err
      }
    },
    async revertInit() {
      const {context, getQueries, getAlters} = createSchemaToolContext()
      initializers.forEach(handler => handler.down(context))
      const alters = getAlters()
      const queries = getQueries()
      try {
        await Promise.all(alters.map(line => manager.getPool().execute(line)))
        do {
          const query = queries.shift()
          await manager.getPool().execute(query)
        } while (queries.length)
        return true
      } catch (err) {
        logger && logger.error('There\'s a problem with database init', err)
        throw err
      }
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
