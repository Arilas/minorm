import { createManager } from '@minorm/core'
import { createSchemaTool, SchemaTool } from '@minorm/schema-tool'
import { setupSchema, createFixtureManager } from './fixtures'
import Config from './config'
import { createAdapter } from '../../src'

describe('Integration', () => {
  describe('createManager', () => {
    const manager = createManager(createAdapter(Config.connection))
    let schemaTool: SchemaTool
    const fixtureManager = createFixtureManager(manager)
    beforeEach(async () => {
      await manager.ready()
      schemaTool = createSchemaTool(manager)
      await setupSchema(schemaTool)
    })

    test('should assign related rows', async () => {
      await fixtureManager.createPost()
      const [{ post, creator }] = await manager
        .startQuery()
        .select()
        .from('posts', 'post')
        .field('post.*')
        .field('creator.*')
        .include('post', 'creator_id')
        .execute(true)
      expect(typeof post).toBe('object')
      expect(typeof creator).toBe('object')
      expect(typeof post.id).toBe('number')
      expect(typeof creator.id).toBe('number')
    })

    test('should map related rows', async () => {
      await fixtureManager.createPost()
      const [post] = await manager
        .startQuery()
        .select()
        .from('posts', 'post')
        .field('post.*')
        .field('creator.*')
        .include('post', 'creator_id')
        .getMapper()
        .fetch()
      expect(typeof post).toBe('object')
      expect(typeof post.creator).toBe('object')
      expect(typeof post.id).toBe('number')
      expect(typeof post.creator.id).toBe('number')
      expect(post.creator_id).toEqual(post.creator.id)
    })

    test('should update models', async () => {
      const user = await fixtureManager.createUser()
      expect(typeof user.id).toBe('number')
      user.populate({
        login: 'testUser',
        // @ts-ignore
        ololo: 'da',
      })
      await user.save()
      const fetchedUser = await manager.getRepository('users').find(user.id)
      if (!fetchedUser) {
        throw new Error('User must be in database')
      }
      expect(user.login).toEqual(fetchedUser.login)
      expect(user.password).toEqual(fetchedUser.password)
      expect('ololo' in user).toBeTruthy()
      expect('ololo' in fetchedUser).toBeFalsy()
    })

    test('should remove and insert models', async () => {
      const user = await fixtureManager.createUser()
      expect(typeof user.id).toBe('number')
      await user.remove()
      expect(typeof user.id).toBe('number')
      const fetchedUser = await manager.getRepository('users').find(user.id)
      expect(fetchedUser).toBeNull()
      await user.save()
      const existUser = await manager.getRepository('users').find(user.id)
      if (!existUser) {
        throw new Error('User must be in database')
      }
      expect(existUser).not.toBeNull()
      expect(user.id).toEqual(existUser.id)
      expect(user.login).toEqual(existUser.login)
      expect(user.password).toEqual(existUser.password)
    })

    afterEach(async () => {
      await schemaTool.dropSchema()
      await manager.clear()
    })
  })
})
