import { SchemaTool } from '@minorm/schema-tool' // eslint-disable-line

export async function setupSchema(
  schemaTool: SchemaTool,
  init: boolean = true,
) {
  schemaTool.setSchemaInit({
    up(schema) {
      schema.table('users', ctx => {
        ctx.id()
        ctx.createdAndModified()
        ctx.column('login').notNull()
        ctx.column('password').notNull()
      })
      schema.table('posts', ctx => {
        ctx.id()
        ctx.createdAndModified()
        ctx.column('title').notNull()
        ctx.column('body').text()
        ctx
          .column('creator_id')
          .int()
          .unsigned()
        ctx.index('title')
        ctx.ref('creator_id', 'users', 'id')
      })
      schema.table('comments', ctx => {
        ctx.id()
        ctx.createdAndModified()
        ctx
          .column('creator_id')
          .int()
          .unsigned()
        ctx
          .column('post_id')
          .int()
          .unsigned()
        ctx.column('body')
        ctx.ref('creator_id', 'users', 'id')
        ctx.ref('post_id', 'posts', 'id')
      })
    },
    down(schema) {
      // Will be executed correctly cause we remove FK
      schema.dropTable('comments')
      schema.dropTable('posts')
      schema.dropTable('users')
    },
  })
  if (init) {
    await schemaTool.initSchema()
  }
}
