/** @flow */
import { createManager } from '../../src'
import { createMetadataManager } from './utils/createMetadataManager'
import { createServer } from './utils/createServer'
import Config from './config'
import { createFixtureManager } from '../integration/fixtures/createFixtureManager'

describe('Integration', () => {
  describe('createManager', () => {
    test('should insert data', async () => {
      const server = createServer()
      const oldError = console.error // eslint-disable-line no-console
      // $FlowIgnore
      console.error = (...opts) => {
        // eslint-disable-line no-console
        if (opts[0].indexOf('packets out of order') !== -1) {
          return
        }
        return oldError(...opts)
      }
      const manager = createManager(Config.connection)
      manager.setMetadataManager(createMetadataManager())
      manager.connect()
      await manager.ready()
      const fixtureManager = createFixtureManager(manager)
      const user = await fixtureManager.createUser()
      expect(user.id).toEqual(1)
      const post = await fixtureManager.createPost()
      expect(post.id).toEqual(1)
      expect(post.creator_id).toEqual(2)
      const comment = await fixtureManager.createPostComment(post.id, user.id)
      expect(comment.id).toEqual(1)
      expect(comment.post_id).toEqual(post.id)
      expect(comment.creator_id).toEqual(user.id)
      user.login = 'updated'
      await user.save()
      try {
        await manager
          .startQuery()
          .select()
          .from('users')
          .execute()
      } catch (err) {
        // Should be wrapped
      }
      await manager.getPool().end()
      //$FlowIgnore
      console.error = oldError // eslint-disable-line no-console
      server.close()
    })
  })
})
