/** @flow */
import { createManager } from '../../../src'
import { createFakePool } from '../fixtures/connectionManager'

describe('Unit', () => {
  describe('Manager', () => {
    describe('connectionCreator', () => {
      const faker = createFakePool()
      const config = {
        url: '',
        user: '',
        password: '',
      }
      let manager = createManager(config)

      beforeEach(async () => {
        faker.inject()
        manager.connect()
        await manager.ready()
      })

      it('should return pool', () => {
        const pool = manager.getPool()
        expect(pool).toEqual(faker.pool)
      })

      it('should throw Exception when pool is not created', async () => {
        await manager.clear()
        expect(() => manager.getPool()).toThrowError('Please connect before')
      })

      it('should return configuration', () => {
        expect(manager.getConfiguration()).toEqual(config)
      })

      afterEach(async () => {
        faker.resetAnswers()
        await manager.clear()
      })
    })
  })
})
