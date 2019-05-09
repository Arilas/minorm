import { createManager } from '../../../src'
import { createFakePool } from '../fixtures/connectionManager'

describe('Unit', () => {
  describe('Repository', () => {
    describe('selectorsCreator', () => {
      const faker = createFakePool()
      let manager = createManager({
        host: '',
        user: '',
        password: '',
      })
      const user = {
        id: 1,
        createdAt: 'dsa',
        modifiedAt: 'sfsdfg',
      }
      beforeEach(async () => {
        faker.inject()
        manager.connect()
        await manager.ready()
      })

      it('should start a query builder without alias', async () => {
        const repo = manager.getRepository('users')
        const query = repo.startQuery()
        expect(query.toString()).toEqual('SELECT * FROM users')
        faker.setAnswer('SELECT * FROM users', [user])
        const result = await query.execute()
        expect(result).toMatchObject([user])
      })

      it('should start a query builder with alias', async () => {
        const repo = manager.getRepository('users')
        const query = repo.startQuery('user')
        expect(query.toString()).toEqual('SELECT user.* FROM users `user`')

        faker.setAnswer('SELECT user.* FROM users `user`', [user])
        const result = await query.execute()
        expect(result).toMatchObject([user])
      })

      it('should find data by id and return model', async () => {
        const repo = manager.getRepository('users')
        faker.setAnswer(
          'SELECT * FROM users WHERE (id = ?) LIMIT ?',
          [1, 1],
          [user],
        )
        const result = await repo.find(1)
        if (!result) {
          throw new Error('user should be found')
        }
        expect(result).toEqual(user)
        expect(result.isDirty()).toBeFalsy()
      })

      it('should return null when data by id is not found', async () => {
        const repo = manager.getRepository('users')
        faker.setAnswer(
          'SELECT * FROM users WHERE (id = ?) LIMIT ?',
          [1, 1],
          [],
        )
        const result = await repo.find(1)
        expect(result).toBeNull()
      })

      it('should find data by criteria and return model', async () => {
        const repo = manager.getRepository('users')
        faker.setAnswer(
          'SELECT * FROM users WHERE (id IN (?, ?, ?)) LIMIT ?',
          [1, 2, 3, 1],
          [user],
        )
        const result = await repo.findOneBy({
          id: {
            $in: [1, 2, 3],
          },
        })
        if (!result) {
          throw new Error('user should be found')
        }
        expect(result).toEqual(user)
        expect(result.isDirty()).toBeFalsy()
      })

      it('should return null when data by criteria is not found', async () => {
        const repo = manager.getRepository('users')
        faker.setAnswer(
          'SELECT * FROM users WHERE (id IN (?, ?, ?)) LIMIT ?',
          [1, 2, 3, 1],
          [],
        )
        const result = await repo.findOneBy({
          id: {
            $in: [1, 2, 3],
          },
        })
        expect(result).toBeNull()
      })

      it('should return array of data by criteria and return models', async () => {
        const repo = manager.getRepository('users')
        faker.setAnswer(
          'SELECT * FROM users WHERE (id IN (?, ?, ?))',
          [1, 2, 3],
          [user, user],
        )
        const result = await repo.findBy({
          id: {
            $in: [1, 2, 3],
          },
        })
        if (!result) {
          throw new Error('user should be found')
        }
        expect(result).toHaveLength(2)
        expect(result).toMatchObject([user, user])
        expect(result[0].isDirty()).toBeFalsy()
        expect(result[1].isDirty()).toBeFalsy()
      })

      it('should return array of data with order applied and return model', async () => {
        const repo = manager.getRepository('users')
        faker.setAnswer(
          'SELECT * FROM users WHERE (id IN (?, ?, ?)) ORDER BY id ASC, createdAt DESC',
          [1, 2, 3],
          [user, user],
        )
        const result = await repo.findBy(
          {
            id: {
              $in: [1, 2, 3],
            },
          },
          {
            id: true,
            createdAt: false,
          },
        )
        if (!result) {
          throw new Error('user should be found')
        }
        expect(result).toHaveLength(2)
        expect(result).toMatchObject([user, user])
      })

      it('should return array of data with order applied and limit', async () => {
        const repo = manager.getRepository('users')
        faker.setAnswer(
          'SELECT * FROM users WHERE (id IN (?, ?, ?)) ORDER BY id ASC, createdAt DESC LIMIT ?',
          [1, 2, 3, 10],
          [user, user],
        )
        const result = await repo.findBy(
          {
            id: {
              $in: [1, 2, 3],
            },
          },
          {
            id: true,
            createdAt: false,
          },
          10,
        )
        if (!result) {
          throw new Error('user should be found')
        }
        expect(result).toHaveLength(2)
        expect(result).toMatchObject([user, user])
      })

      it('should return array of data with order applied, limit and offset', async () => {
        const repo = manager.getRepository('users')
        faker.setAnswer(
          'SELECT * FROM users WHERE (id IN (?, ?, ?)) ORDER BY id ASC, createdAt DESC LIMIT ? OFFSET ?',
          [1, 2, 3, 10, 5],
          [user, user],
        )
        const result = await repo.findBy(
          {
            id: {
              $in: [1, 2, 3],
            },
          },
          {
            id: true,
            createdAt: false,
          },
          10,
          5,
        )
        if (!result) {
          throw new Error('user should be found')
        }
        expect(result).toHaveLength(2)
        expect(result).toMatchObject([user, user])
      })

      it('should return empty array when data by criteria is not found', async () => {
        const repo = manager.getRepository('users')
        faker.setAnswer(
          'SELECT * FROM users WHERE (id IN (?, ?, ?))',
          [1, 2, 3],
          [],
        )
        const result = await repo.findBy({
          id: {
            $in: [1, 2, 3],
          },
        })
        expect(result).toHaveLength(0)
      })

      afterEach(async () => {
        faker.resetAnswers()
        await manager.clear()
      })
    })
  })
})
