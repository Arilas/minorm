/** @flow */
import {createManager} from '../../src/index'
import {createSchemaTool} from '../../src/schema'
import Config from '../config'

describe('Smoke', () => {
  describe('Schema Tool', () => {
    it('should init Database schema', async function() {
      this.timeout(5000)
      const manager = createManager(Config.connection)
      manager.connect()
      await manager.ready()
      const schemaTool = createSchemaTool(manager)
      schemaTool.setSchemaInit(schema => {
        schema.table('users', ctx => {
          ctx.column('id').int().unsigned().primary().autoIncrement()
          ctx.column('login').notNull()
          ctx.column('password').notNull()
          ctx.column('createdAt').date()
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
      })
      schemaTool.setSchemaDrop(schema => {
        // Will be executed correctly cause we remove FK
        schema.dropTable('users')
        schema.dropTable('posts')
        // Must be executed before DROP TABLE
        schema.use('posts', table => {
          table.dropRef('FK_creator_id')
        })
      })
      await schemaTool.initSchema()
      await schemaTool.dropSchema()
    })
  })
})