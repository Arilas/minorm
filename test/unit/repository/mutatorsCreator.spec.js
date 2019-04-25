/** @flow */
import { createManager } from '../../../src'
import { createFakePool } from '../fixtures/connectionManager'

describe('Unit', () => {
  describe('Repository', () => {
    describe('mutatorsCreator', () => {
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
        const repo = manager.getRepository('users')
        faker.setAnswer(
          'INSERT INTO users (createdAt, modifiedAt) VALUES (?, ?)',
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
        const repo = manager.getRepository('users')
        faker.setAnswer(
          'UPDATE users SET createdAt = ?, modifiedAt = ? WHERE (id = ?)',
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
        const repo = manager.getRepository('users')
        faker.setAnswer(
          'UPDATE users SET createdAt = ?, modifiedAt = ? WHERE (id IN (?, ?, ?))',
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
        expect(() =>
          // $FlowIgnore
          repo.update(undefined, { createdAt: 'dsa', modifiedAt: 'dsaads' }),
        ).toThrowError(
          'Please check that you provide selector and changes for update',
        )
        expect(() =>
          // $FlowIgnore
          repo.update(null, { createdAt: 'dsa', modifiedAt: 'dsaads' }),
        ).toThrowError(
          'Please check that you provide selector and changes for update',
        )
        // $FlowIgnore
        expect(() => repo.update(5, undefined)).toThrowError(
          'Please check that you provide selector and changes for update',
        )
        // $FlowIgnore
        expect(() => repo.update(5, null)).toThrowError(
          'Please check that you provide selector and changes for update',
        )
        // $FlowIgnore
        expect(() => repo.update(undefined, undefined)).toThrowError(
          'Please check that you provide selector and changes for update',
        )
        // $FlowIgnore
        expect(() => repo.update(null, null)).toThrowError(
          'Please check that you provide selector and changes for update',
        )
      })

      it('should remove data with id as selector', async () => {
        const repo = manager.getRepository('users')
        faker.setAnswer('DELETE FROM users WHERE (id = ?)', {
          affectedRows: 1,
        })
        const affectedRows = await repo.remove(5)
        expect(affectedRows).toEqual(1)
      })

      it('should update data by criteria as selector', async () => {
        const repo = manager.getRepository('users')
        faker.setAnswer('DELETE FROM users WHERE (id IN (?, ?, ?))', {
          affectedRows: 3,
        })
        const affectedRows = await repo.remove({
          id: {
            $in: [1, 2, 3],
          },
        })
        expect(affectedRows).toEqual(3)
      })

      it("should throw eror when there's no condition or changes", () => {
        const repo = manager.getRepository('users')
        expect(() =>
          // $FlowIgnore
          repo.remove(undefined),
        ).toThrowError('Please provide selector for remove')
        expect(() =>
          // $FlowIgnore
          repo.remove(null),
        ).toThrowError('Please provide selector for remove')
      })

      afterEach(async () => {
        await manager.clear()
      })
    })
  })
})
