import { createManager } from '../../../src'
import { createFakePool } from '../fixtures/connectionManager'

describe('Unit', () => {
  describe('Manager', () => {
    describe('repositoryCreator', () => {
      const faker = createFakePool()
      const manager = createManager(faker.pool)
      beforeEach(async () => {
        faker.inject()

        await manager.ready()
      })

      it('should return Repository', () => {
        const repo = manager.getRepository('users')
        const repo2 = manager.getRepository('users')
        expect(repo).toEqual(repo2)
        const metadata = repo.getMetadata()
        expect(metadata).toMatchObject({
          id: {
            tableName: 'users',
            columnName: 'id',
          },
          createdAt: {
            tableName: 'users',
            columnName: 'createdAt',
          },
        })
      })

      afterEach(async () => {
        faker.resetAnswers()
        await manager.clear()
      })
    })
  })
})
