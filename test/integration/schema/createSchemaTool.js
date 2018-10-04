/** @flow */
import { createManager } from '../../../src/index'
import {createSchemaTool} from '../../../src/schema'
import Config from '../config'

describe('Integration', () => {
  describe('Schema', () => {
    test('should init Database schema', async () => {
      const manager = createManager(Config.connection)
      manager.connect()
      await manager.ready()
      const schemaTool = createSchemaTool(manager)
      schemaTool.setSchemaInit({
        up(schema) {
          schema.table('users', ctx => {
            ctx.column('id').int().unsigned().primary().autoIncrement()
            ctx.column('login').notNull()
            ctx.column('password').notNull()
            ctx.column('columnToDrop')
            ctx.column('createdAt').dateTime()
          })
          schema.table('posts', ctx => {
            ctx.column('id').int().unsigned().primary().autoIncrement()
            ctx.column('title').notNull()
            ctx.column('body').text()
            ctx.column('creator_id').int().unsigned()
            ctx.column('createdAt').date()
            ctx.index('title')
            ctx.ref('creator_id', 'users', 'id')
          })
          schema.put('users', [
            {
              login: 'test',
              password: 'test'
            },
            {
              login: 'test2',
              password: 'test2'
            }
          ])
        },
        down(schema) {
          // Will be executed correctly cause we remove FK
          schema.dropTable('users')
          schema.dropTable('posts')
          // Must be executed before DROP TABLE
          schema.use('posts', table => {
            table.dropColumnRef('creator_id')
          })
        }
      })
      // Must be applied second
      schemaTool.getMigrationManager().addMigration(
        '2016-11-16 18:04:24',
        {
          up(schema) {
            schema.use('users', table => {
              table.dropColumn('secondDrop')
            })
          },
          down(schema) {
            schema.use('users', table => {
              table.column('secondDrop')
            })
          }
        } 
      )
      // First migration
      schemaTool.getMigrationManager().addMigration(
        '2016-11-16 17:42:15',
        {
          up(schema) {
            schema.use('users', table => {
              table.dropColumn('columnToDrop')
              table.column('secondDrop')
            })
          },
          down(schema) {
            schema.use('users', table => {
              table.column('columnToDrop')
              table.dropColumn('secondDrop')
            })
          }
        } 
      )
      await schemaTool.initSchema()
      expect(manager.getMetadataManager().hasTable('users')).toBe(true)
      expect(manager.getMetadataManager().hasTable('posts')).toBe(true)
      await schemaTool.dropSchema()
    })

    test('should apply changes when I directly ask for this', async () => {
      const manager = createManager(Config.connection)
      manager.connect()
      await manager.ready()
      const schemaTool = createSchemaTool(manager)
      schemaTool.setSchemaInit({
        up: function* (schema) {
          schema.table('users', ctx => {
            ctx.column('id').int().unsigned().primary().autoIncrement()
            ctx.column('login').notNull()
            ctx.column('password').notNull()
            ctx.column('columnToDrop')
            ctx.column('createdAt').dateTime()
          })
          schema.put('users', [
            {
              login: 'test',
              password: 'test'
            },
            {
              login: 'test2',
              password: 'test2'
            }
          ])
          yield schema.asyncExecute()
          const [users] = yield schema.asyncQuery('SELECT * FROM users WHERE login = \'test\'')
          expect(users.length).toBe(1)
          schema.table('posts', ctx => {
            ctx.column('id').int().unsigned().primary().autoIncrement()
            ctx.column('title').notNull()
            ctx.column('body').text()
            ctx.column('creator_id').int().unsigned()
            ctx.column('createdAt').date()
            ctx.index('title')
            ctx.ref('creator_id', 'users', 'id')
          })
          yield schema.asyncExecute()
        },
        down(schema) {
          // Will be executed correctly cause we remove FK
          schema.dropTable('users')
          schema.dropTable('posts')
          // Must be executed before DROP TABLE
          schema.use('posts', table => {
            table.dropColumnRef('creator_id')
          })
        }
      })
      await schemaTool.initSchema()
      expect(manager.getMetadataManager().hasTable('users')).toBe(true)
      expect(manager.getMetadataManager().hasTable('posts')).toBe(true)
      await schemaTool.dropSchema()
    })
  })
})
