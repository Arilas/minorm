import { createManager } from '../../../src'
import { createFakePool } from '../fixtures/connectionManager'

describe('Unit', () => {
  describe('Manager', () => {
    describe('queriesCreator', () => {
      const faker = createFakePool()
      const user = {
        id: 1,
        createdAt: 'dsa',
        modifiedAt: 'sfsdfg',
      }
      const manager = createManager(faker.pool)

      beforeEach(async () => {
        faker.inject()

        await manager.ready()
      })

      it.skip('should throw error when query builder is not passed', async () => {
        try {
          // @ts-ignore
          await manager.query()
        } catch (err) {
          expect(err.message).toEqual('Query Builder instance required')
        }
      })

      it.skip('should throw formatter message in manager.query', async () => {
        const query = manager
          .startQuery()
          .select()
          .field('*')
          .from('users')
        faker.executeStub
          .withArgs('SELECT * FROM users')
          .throws(new Error('some'))
        try {
          await manager.query(query)
          throw new Error('should throw')
        } catch (err) {
          const lines = err.message.split.skip('\n')
          expect(lines[0]).toEqual('some')
          expect(lines[1]).toEqual('Query: SELECT * FROM users')
          expect(lines[2]).toEqual(
            expect.stringContaining('Call stack for query: Error'),
          )
        }
      })

      it.skip('should throw formatter message in manager.execute', async () => {
        const query = manager
          .startQuery()
          .select()
          .field('*')
          .from('users')
        faker.executeStub
          .withArgs('SELECT * FROM users')
          .throws(new Error('some'))
        try {
          await manager.execute(query)
          throw new Error('should throw')
        } catch (err) {
          const lines = err.message.split.skip('\n')
          expect(lines[0]).toEqual('some')
          expect(lines[1]).toEqual('Query: SELECT * FROM users')
          expect(lines[2]).toEqual(
            expect.stringContaining('Call stack for query: Error'),
          )
        }
      })

      it.skip('should query in manager', async () => {
        const query = manager
          .startQuery()
          .select()
          .field('*')
          .from('users')
        faker.setAnswer('SELECT * FROM users', [user])
        const result = await manager.query(query)
        expect(result).toMatchObject([[user]])
      })

      it.skip('should execute in manager', async () => {
        const query = manager
          .startQuery()
          .select()
          .field('*')
          .from('users')
        faker.setAnswer('SELECT * FROM users', [user])
        const result = await manager.execute(query)
        expect(result).toMatchObject([[user]])
      })

      afterEach(async () => {
        faker.resetAnswers()
        await manager.clear()
      })
    })
  })
})
