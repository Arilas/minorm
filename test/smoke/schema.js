import {createManager} from '../../src/index'
import {createSchemaTool} from '../../src/schema'
import Config from '../config'

describe('Smoke', () => {
  describe('Schema Tool', () => {
    it('should init Database schema', async () => {
      const manager = createManager(Config.connection)
      manager.connect()
      await manager.ready()
      const schemaTool = createSchemaTool(manager)
      await schemaTool.initSchema(schema => {
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
    })
  })
})