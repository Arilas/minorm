/** @flow */
import {assert} from 'chai'
import {createManager} from '../../src'
import { createMetadataManager } from './utils/createMetadataManager'
import { createServer } from './utils/createServer'
import Config from './config'
import { createFixtureManager } from '../integration/fixtures/createFixtureManager'

describe('Integration', () => {
  describe('createManager', () => {
    it('should insert data', async () => {
      createServer()
      const manager = createManager(Config.connection)
      manager.setMetadataManager(createMetadataManager())
      manager.connect()
      await manager.ready()
      const fixtureManager = createFixtureManager(manager)
      const user = await fixtureManager.createUser()
      assert.equal(user.id, 1)
      const post = await fixtureManager.createPost()
      assert.equal(post.id, 1)
      assert.equal(post.creator_id, 2)
      const comment = await fixtureManager.createPostComment(post.id, user.id)
      assert.equal(comment.id, 1)
      assert.equal(comment.post_id, post.id)
      assert.equal(comment.creator_id, user.id)
      user.login = 'updated'
      await user.save()
    })
  })
})