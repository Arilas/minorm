import { createManager } from '../../src'
import { createFakePool } from './fixtures/connectionManager'

describe('Unit', () => {
  describe('createManager', () => {
    const faker = createFakePool()
    beforeAll(async () => {
      faker.inject()
    })

    it('should return pool', async () => {
      const manager = createManager({
        host: '',
        user: '',
        password: '',
      })
      manager.connect()
      await manager.ready()

      expect(manager.getPool()).toEqual(faker.pool)
    })

    it('should setup metadata', async () => {
      const manager = createManager({
        host: '',
        user: '',
        password: '',
      })
      manager.connect()
      await manager.ready()

      const metadataManager = manager.getMetadataManager()
      expect(metadataManager.isLoaded()).toBeTruthy()
      expect(metadataManager.hasTable('users')).toBeTruthy()
      expect(metadataManager.hasTable('posts')).toBeTruthy()
      expect(metadataManager.hasTable('comments')).toBeTruthy()
      expect(metadataManager.hasAssociation('posts', 'creator_id')).toBeTruthy()
      expect(
        metadataManager.hasAssociation('comments', 'creator_id'),
      ).toBeTruthy()
      expect(metadataManager.hasAssociation('comments', 'post_id')).toBeTruthy()
    })

    it('should execute an select query', async () => {
      const manager = createManager({
        host: '',
        user: '',
        password: '',
      })
      manager.connect()
      await manager.ready()

      const user = {
        id: 1,
      }
      faker.setAnswer('SELECT * FROM users WHERE (id = ?)', user)
      const userFetched = await manager
        .startQuery()
        .select()
        .from('users')
        .field('*')
        .where('id = ?', 1)
        .execute()

      expect(userFetched).toEqual(user)
    })

    it('should clear everything when we call clear', async () => {
      const manager = createManager({
        host: '',
        user: '',
        password: '',
      })
      manager.connect()
      await manager.ready()
      let metadataManager = manager.getMetadataManager()
      expect(metadataManager.isLoaded()).toBeTruthy()
      faker.pool.end.resetHistory()
      await manager.clear()
      expect(faker.pool.end.calledOnce).toBeTruthy()
      metadataManager = manager.getMetadataManager()
      expect(metadataManager.isLoaded()).toBeFalsy()
    })
  })
})
