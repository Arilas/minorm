/** @flow */
import { createManager } from '../../../src'
import { createFakePool } from '../fixtures/connectionManager'

describe('Unit', () => {
  describe('Manager', () => {
    describe('queriesCreator', () => {
      const faker = createFakePool()
      const config = {
        url: '',
        user: '',
        password: '',
      }
      const user = {
        id: 1,
        createdAt: 'dsa',
        modifiedAt: 'sfsdfg',
      }
      let manager = createManager(config)

      beforeEach(async () => {
        faker.inject()
        manager.connect()
        await manager.ready()
      })

      it('should throw error when query builder is not passed', async () => {
        try {
          // $FlowIgnore
          await manager.query()
        } catch (err) {
          expect(err.message).toEqual('Query Builder instance required')
        }
      })

      it('should throw formatter message in manager.query', async () => {
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
          const lines = err.message.split('\n')
          expect(lines[0]).toEqual('some')
          expect(lines[1]).toEqual('Query: SELECT * FROM users')
          expect(lines[2]).toEqual('Call stack for query: Error')
        }
      })

      it('should throw formatter message in manager.execute', async () => {
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
          const lines = err.message.split('\n')
          expect(lines[0]).toEqual('some')
          expect(lines[1]).toEqual('Query: SELECT * FROM users')
          expect(lines[2]).toEqual('Call stack for query: Error')
        }
      })

      it('should query in manager', async () => {
        const query = manager
          .startQuery()
          .select()
          .field('*')
          .from('users')
        faker.setAnswer('SELECT * FROM users', [user])
        const result = await manager.query(query)
        expect(result).toMatchObject([[user]])
      })

      it('should execute in manager', async () => {
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
