import { createManager } from '../../../src'
import { createFakePool } from '../fixtures/connectionManager'

describe('Unit', () => {
  describe('Manager', () => {
    describe('connectionCreator', () => {
      const faker = createFakePool()
      const manager = createManager(faker.pool)

      beforeEach(async () => {
        faker.inject()

        await manager.ready()
      })

      it('should return pool', () => {
        const pool = manager.getAdapter()
        expect(pool).toEqual(faker.pool)
      })

      afterEach(async () => {
        faker.resetAnswers()
        await manager.clear()
      })
    })
  })
})
