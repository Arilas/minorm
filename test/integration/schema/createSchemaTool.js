/** @flow */
import {createManager} from '../../../src/index'
import {createSchemaTool} from '../../../src/schema'
import Config from '../config'

describe('Integration', () => {
  describe('Schema', () => {
    it('should init Database schema', async function() {
      this.timeout(10000)
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
            ctx.ref('creator_id', 'users', 'id', 'FK_creator_id')
          })
        },
        down(schema) {
          // Will be executed correctly cause we remove FK
          schema.dropTable('users')
          schema.dropTable('posts')
          // Must be executed before DROP TABLE
          schema.use('posts', table => {
            table.dropRef('FK_creator_id')
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
      await schemaTool.dropSchema()
    })
  })
})
