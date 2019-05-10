import { createMigrationContext } from './createMigrationContext'
import { MINORM_MIGRATIONS_TABLE } from './constants'
import { MigrationManager, Migration } from './types'
import { Manager, RowDataPacket } from '@minorm/core'

const MIGRATIONS_QUERY = `SELECT migration FROM ${MINORM_MIGRATIONS_TABLE}`

type MigrationsMap = Map<string, Migration>

const Generator = Object.getPrototypeOf(Function('return function*() {}')())

export function createMigrationManager(manager: Manager): MigrationManager {
  const initializers: MigrationsMap = new Map()
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
          .map(migration => [migration, migrations.get(migration)]),
      )
      await this.execute(migrationsToRevert as Map<string, Migration>, 'down')
      await this.execute(initializers, 'down')
      return true
    },
    async execute(migrations: Map<string, Migration>, method: 'up' | 'down') {
      const MigrationsRepo = manager.getRepository(MINORM_MIGRATIONS_TABLE)
      for (const [key, handler] of migrations) {
        const {
          context,
          resetQueries,
          getPreQueries,
          getAddQueries,
          getDropQueries,
          getAddAlters,
          getDropAlters,
          getPostQueries,
        } = createMigrationContext(manager.getMetadataManager())
        if (Object.getPrototypeOf(handler[method]) === Generator) {
          const generator = handler[method](context) as Generator
          let send = null
          // eslint-disable-next-line
          while (true) {
            const result = generator.next(send)
            if (result.done) {
              break
            }
            const gateway = result.value
            if (!gateway || !gateway.getAction().type) {
              continue
            }
            const action = gateway.getAction()
            switch (action.type) {
              case 'QUERY': {
                send = await manager
                  .getAdapter()
                  ._execute({ sql: action.payload.sql })
                break
              }
              case 'APPLY': {
                await Promise.all(
                  getPreQueries().map(line =>
                    manager.getAdapter()._execute({ sql: line }),
                  ),
                )
                await Promise.all(
                  getDropAlters().map(line =>
                    manager.getAdapter()._execute({ sql: line }),
                  ),
                )
                // Because some of people don't drop foreign keys before and order is matter
                for (const line of getDropQueries()) {
                  await manager.getAdapter()._execute({ sql: line })
                }
                await Promise.all(
                  getAddQueries().map(line =>
                    manager.getAdapter()._execute({ sql: line }),
                  ),
                )
                await Promise.all(
                  getAddAlters().map(line =>
                    manager.getAdapter()._execute({ sql: line }),
                  ),
                )
                await Promise.all(
                  getPostQueries().map(line =>
                    manager.getAdapter()._execute({ sql: line }),
                  ),
                )
                await manager.clear()
                manager.connect()
                await manager.ready()

                resetQueries()
                break
              }
            }
          }
        } else {
          handler[method](context)
        }
        await Promise.all(
          getPreQueries().map(line =>
            manager.getAdapter()._execute({ sql: line }),
          ),
        )
        await Promise.all(
          getDropAlters().map(line =>
            manager.getAdapter()._execute({ sql: line }),
          ),
        )
        // Because some of people don't drop foreign keys before and order is matter
        for (const line of getDropQueries()) {
          await manager.getAdapter()._execute({ sql: line })
        }
        await Promise.all(
          getAddQueries().map(line =>
            manager.getAdapter()._execute({ sql: line }),
          ),
        )
        await Promise.all(
          getAddAlters().map(line =>
            manager.getAdapter()._execute({ sql: line }),
          ),
        )
        await Promise.all(
          getPostQueries().map(line =>
            manager.getAdapter()._execute({ sql: line }),
          ),
        )
        await manager.clear()
        manager.connect()
        await manager.ready()
        if (method === 'up') {
          const date = new Date()
          const formattedDate = `${date.getFullYear()}-${date.getUTCMonth()}-${date.getDate()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`
          await MigrationsRepo.create({
            migration: key,
            createdAt: formattedDate,
            modifiedAt: formattedDate,
          }).save()
        } else {
          try {
            const migration = await MigrationsRepo.findOneBy({
              migration: key,
            })
            if (migration) {
              await migration.remove()
            }
          } catch (err) {
            // Everything good. We just removed migrations table :)
          }
        }
      }
      return true
    },
    async getMigrationsToExecute(): Promise<MigrationsMap> {
      // @ts-ignore
      const [result]: [RowDataPacket[]] = await manager
        .getAdapter()
        ._execute({ sql: MIGRATIONS_QUERY })
      const appliedMigrations = result.reduce(
        (target, row) => ({
          ...target,
          [row.migration]: true,
        }),
        {},
      )

      // @ts-ignore
      return new Map(
        Array.from(migrations.keys())
          .filter(migration => !appliedMigrations.hasOwnProperty(migration))
          .sort()
          .map(migration => [migration, migrations.get(migration)]),
      )
    },
  }
}
