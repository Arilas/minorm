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
      this.timeout(10000)
      manager.connect()
      await manager.ready()
      schemaTool = createSchemaTool(manager)
      await setupSchema(schemaTool)
    })

    it('should assign related rows', async () => {
      await fixtureManager.createPost()
      const [{post, creator}] = await manager.startQuery().select()
        .from('posts', 'post')
        .field('post.*')
        .field('creator.*')
        .include('post', 'creator_id')
        .execute(true)
      assert.isObject(post)
      assert.isObject(creator)
      assert.isNumber(post.id)
      assert.isNumber(creator.id)
    })

    it('should update models', async () => {
      const user = await fixtureManager.createUser()
      assert.isNumber(user.id)
      user.populate({
        login: 'testUser',
        ololo: 'da'
      })
      await user.save()
      const fetchedUser = await manager.getRepository('users').find(user.id)
      if (!fetchedUser) {
        throw new Error('User must be in database')
      }
      assert.equal(user.login, fetchedUser.login)
      assert.equal(user.password, fetchedUser.password)
      assert.property(user, 'ololo')
      assert.notProperty(fetchedUser, 'ololo')
    })

    it('should remove and insert models', async () => {
      const user = await fixtureManager.createUser()
      assert.isNumber(user.id)
      await user.remove()
      assert.isNumber(user.id)
      const fetchedUser = await manager.getRepository('users').find(user.id)
      assert.isNull(fetchedUser)
      await user.save()
      const existUser = await manager.getRepository('users').find(user.id)
      if (!existUser) {
        throw new Error('User must be in database')
      }
      assert.isNotNull(existUser)
      assert.equal(user.id, existUser.id)
      assert.equal(user.login, existUser.login)
      assert.equal(user.password, existUser.password)
    })

    afterEach(async function() {
      this.timeout(10000)
      await schemaTool.dropSchema()
      manager.clear()
    })
  })
})