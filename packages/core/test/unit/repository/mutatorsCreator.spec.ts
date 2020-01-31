import { createManager } from '../../../src'
import { createFakePool } from '../fixtures/connectionManager'

describe('Unit', () => {
  describe('Repository', () => {
    describe('mutatorsCreator', () => {
      const faker = createFakePool()
      const manager = createManager(faker.pool)
      beforeEach(async () => {
        faker.inject()

        await manager.ready()
      })

      it('should return Metadata', () => {
        const repo = manager.getRepository('users')
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

      it('should throw Error when manager is cleared', async () => {
        const repo = manager.getRepository('users')
        await manager.clear()
        expect(() => repo.getMetadata()).toThrowError(
          'Metadata is not loaded! Please check bootstrap code',
        )
      })

      it('should insert data', async () => {
        const repo = manager.getRepository<{
          id?: number
          createdAt: string
          modifiedAt: string
        }>('users')
        faker.setAnswer(
          'INSERT INTO users (createdAt, modifiedAt) VALUES (?, ?)',
          ['das', 'asddsaf'],
          {
            insertId: 1,
          },
        )
        const insertId = await repo.insert({
          createdAt: 'das',
          modifiedAt: 'asddsaf',
        })
        expect(insertId).toEqual(1)
      })

      it('should update data with id as selector', async () => {
        const repo = manager.getRepository<{
          id?: number
          createdAt: string
          modifiedAt: string
        }>('users')
        faker.setAnswer(
          'UPDATE users SET createdAt = ?, modifiedAt = ? WHERE (id = ?)',
          ['das', 'asddsaf', 5],
          {
            affectedRows: 1,
          },
        )
        const affectedRows = await repo.update(5, {
          createdAt: 'das',
          modifiedAt: 'asddsaf',
        })
        expect(affectedRows).toEqual(1)
      })

      it('should update data by criteria as selector', async () => {
        const repo = manager.getRepository<{
          id?: number
          createdAt: string
          modifiedAt: string
        }>('users')
        faker.setAnswer(
          'UPDATE users SET createdAt = ?, modifiedAt = ? WHERE (id IN (?, ?, ?))',
          ['das', 'asddsaf', 1, 2, 3],
          {
            affectedRows: 3,
          },
        )
        const affectedRows = await repo.update(
          {
            id: {
              $in: [1, 2, 3],
            },
          },
          {
            createdAt: 'das',
            modifiedAt: 'asddsaf',
          },
        )
        expect(affectedRows).toEqual(3)
      })

      it("should throw eror when there's no condition or changes", () => {
        const repo = manager.getRepository('users')
        expect(
          // @ts-ignore
          repo.update(undefined, { createdAt: 'dsa', modifiedAt: 'dsaads' }),
        ).rejects.toEqual(
          new Error(
            'Please check that you provide selector and changes for update',
          ),
        )
        expect(
          // @ts-ignore
          repo.update(null, { createdAt: 'dsa', modifiedAt: 'dsaads' }),
        ).rejects.toEqual(
          new Error(
            'Please check that you provide selector and changes for update',
          ),
        )
        // @ts-ignore
        expect(repo.update(5, undefined)).rejects.toEqual(
          new Error(
            'Please check that you provide selector and changes for update',
          ),
        )
        // @ts-ignore
        expect(repo.update(5, null)).rejects.toEqual(
          new Error(
            'Please check that you provide selector and changes for update',
          ),
        )
        // @ts-ignore
        expect(repo.update(undefined, undefined)).rejects.toEqual(
          new Error(
            'Please check that you provide selector and changes for update',
          ),
        )
        // @ts-ignore
        expect(repo.update(null, null)).rejects.toEqual(
          new Error(
            'Please check that you provide selector and changes for update',
          ),
        )
      })

      it('should remove data with id as selector', async () => {
        const repo = manager.getRepository('users')
        faker.setAnswer('DELETE FROM users WHERE (id = ?)', [5], {
          affectedRows: 1,
        })
        const affectedRows = await repo.remove(5)
        expect(affectedRows).toEqual(1)
      })

      it('should update data by criteria as selector', async () => {
        const repo = manager.getRepository('users')
        faker.setAnswer(
          'DELETE FROM users WHERE (id IN (?, ?, ?))',
          [1, 2, 3],
          {
            affectedRows: 3,
          },
        )
        const affectedRows = await repo.remove({
          id: {
            $in: [1, 2, 3],
          },
        })
        expect(affectedRows).toEqual(3)
      })

      it("should throw eror when there's no condition or changes", () => {
        const repo = manager.getRepository('users')
        // @ts-ignore
        expect(repo.remove(undefined)).rejects.toEqual(
          new Error('Please provide selector for remove'),
        )
        // @ts-ignore
        expect(repo.remove(null)).rejects.toEqual(
          new Error('Please provide selector for remove'),
        )
      })

      afterEach(async () => {
        faker.resetAnswers()
        await manager.clear()
      })
    })
  })
})
