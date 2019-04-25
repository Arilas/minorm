/** @flow */
import { createManager } from '../../../src'
import { createFakePool } from '../fixtures/connectionManager'

describe('Unit', () => {
  describe('Manager', () => {
    describe('repositoryCreator', () => {
      const faker = createFakePool()
      let manager = createManager({
        url: '',
        user: '',
        password: '',
      })
      beforeEach(async () => {
        faker.inject()
        manager.connect()
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
