/** @flow */
import { createManager } from '../../../src'
import { createFakePool } from '../fixtures/connectionManager'

describe('Unit', () => {
  describe('Manager', () => {
    describe('metadataCreator', () => {
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
        // $FlowFixMe
        manager.setMetadataManager(fake)
        const metadataManager = manager.getMetadataManager()
        expect(metadataManager.isLoaded()).toBeFalsy()
        // $FlowFixMe
        expect(metadataManager.isFake).toBeTruthy()
      })

      afterEach(async () => {
        faker.resetAnswers()
        await manager.clear()
      })
    })
  })
})
