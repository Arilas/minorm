import { createManager } from '../../../src'
import { createFakePool } from '../fixtures/connectionManager'

describe('Unit', () => {
  describe('Manager', () => {
    describe('metadataCreator', () => {
      const faker = createFakePool()
      let manager = createManager(faker.pool)

      beforeEach(async () => {
        faker.inject()

        await manager.ready()
      })

      it('should return Metadata Manager', () => {
        const metadataManager = manager.getMetadataManager()
        expect(metadataManager.isLoaded()).toBeTruthy()
      })

      it('should be possible to replace Metadata Manager', async () => {
        const fake = {
          isLoaded: () => false,
          isFake: true,
          clear: () => null,
        }
        // @ts-ignore
        manager.setMetadataManager(fake)
        const metadataManager = manager.getMetadataManager()
        expect(metadataManager.isLoaded()).toBeFalsy()
        // @ts-ignore
        expect(metadataManager.isFake).toBeTruthy()
      })

      afterEach(async () => {
        faker.resetAnswers()
        await manager.clear()
      })
    })
  })
})
