/** @flow */
import {assert} from 'chai'
import {createManager} from '../../src'
import {createSchemaTool} from '../../src/schema'
import {setupSchema, createFixtureManager} from './fixtures'
import Config from './config'

describe('Integration', () => {
  describe('createManager', () => {
    const manager = createManager(Config.connection)
    let schemaTool
    const fixtureManager = createFixtureManager(manager)
    beforeEach(async function () {
      this.timeout(5000)
      manager.connect()
      await manager.ready()
      schemaTool = createSchemaTool(manager)
      await setupSchema(schemaTool)
    })

    it('should assign related rows', async () => {
      await fixtureManager.createPost()
      const [{post, creator}] = await manager.startQuery().select()
        .from('posts', 'post')
        .include('post', 'creator_id')
        .execute(true)
      assert.isObject(post)
      assert.isObject(creator)
      assert.isNumber(post.id)
      assert.isNumber(creator.id)
    })

    afterEach(async function() {
      this.timeout(5000)
      await schemaTool.dropSchema()
      manager.clear()
    })
  })
})