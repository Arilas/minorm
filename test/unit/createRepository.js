/** @flow */
import { createRepository } from '../../src/createRepository'
import insert from '../../src/query/insert'
import select from '../../src/query/select'
import update from '../../src/query/update'
import remove from '../../src/query/delete'

const uMetadata = {
  id: {
    columnName: 'id',
  },
  some: {
    columnName: 'some',
  },
}

function createStubManager() {
  return {
    getMetadataManager() {
      return {
        ready() {
          return Promise.resolve(true)
        },
        getColumns() {
          return uMetadata
        },
      }
    },
    startQuery() {
      return {
        insert: options => insert(this, options),
        update: options => update(this, options),
        select: options => select(this, options),
        delete: options => remove(this, options),
        remove: options => remove(this, options),
      }
    },
    query() {
      throw new Error('You must override query method')
    },
    clear() {},
  }
}
describe('Unit', () => {
  describe('createRepository', () => {
    test('should find data by id', async () => {
      const QUERY = 'SELECT * FROM u WHERE (id = ?)'
      const manager = {
        ...createStubManager(),
        query(query) {
          const { text, values } = query.toParam()
          expect(text).toEqual(QUERY)
          expect(values.length).toBe(1)
          expect(values || []).toContain(1)
          return Promise.resolve([
            [
              {
                id: 1,
                some: 'field',
              },
            ],
          ])
        },
      }
      // $FlowIgnore fix for model
      const uRepo = createRepository('u', manager)
      const record = await uRepo.find(1)
      expect(record).not.toBeNull()
      if (record == null) return //Flow hack
      expect(record['id']).toBe(1)
      expect(record['some']).toBe('field')
    })
    test('should findOne data by criteria', async () => {
      const QUERY = 'SELECT * FROM u WHERE (id = ?) LIMIT ?'
      const manager = {
        ...createStubManager(),
        query(query) {
          const { text, values } = query.toParam()
          expect(text).toEqual(QUERY)
          expect(values.length).toBe(2)
          expect(values || []).toContain(1)
          return Promise.resolve([
            [
              {
                id: 1,
                some: 'field',
              },
            ],
          ])
        },
      }
      // $FlowIgnore fix for model
      const uRepo = createRepository('u', manager)
      const record = await uRepo.findOneBy({ id: 1 })
      expect(record).not.toBeNull()
      if (record == null) return //Flow hack
      expect(record['id']).toBe(1)
      expect(record['some']).toBe('field')
    })
    test('should find data by criteria', async () => {
      const QUERY = 'SELECT * FROM u WHERE (id = ?)'
      const manager = {
        ...createStubManager(),
        query(query) {
          const { text, values } = query.toParam()
          expect(text).toEqual(QUERY)
          expect(values.length).toBe(1)
          expect(values || []).toContain(1)
          return Promise.resolve([
            [
              {
                id: 1,
                some: 'field',
              },
            ],
          ])
        },
      }
      // $FlowIgnore fix for model
      const uRepo = createRepository('u', manager)
      const result = await uRepo.findBy({ id: 1 })
      expect(result.length).toBe(1)
      const [record] = result
      expect(record).not.toBeNull()
      if (record == null) return //Flow hack
      expect(record['id']).toBe(1)
      expect(record['some']).toBe('field')
    })
    test('should findOne data by hard criteria', async () => {
      const QUERY =
        'SELECT * FROM u WHERE (id IN (?, ?)) AND (status != ?) AND (name LIKE ?) AND (foo NOT IN (?, ?))'
      const manager = {
        ...createStubManager(),
        query(query) {
          const { text, values } = query.toParam()
          expect(text).toEqual(QUERY)
          expect(values.length).toBe(6)
          expect(values || []).toContain(1)
          expect(values || []).toContain(2)
          return Promise.resolve([
            [
              {
                id: 1,
                some: 'field',
              },
            ],
          ])
        },
      }
      // $FlowIgnore fix for model
      const uRepo = createRepository('u', manager)
      const result = await uRepo.findBy({
        id: {
          $in: [1, 2],
        },
        status: {
          $not: 1,
        },
        name: {
          $like: 'test',
        },
        foo: {
          $notIn: [1, 2],
        },
      })
      expect(result.length).toBe(1)
      const [record] = result
      expect(record).not.toBeNull()
      if (record == null) return //Flow hack
      expect(record['id']).toBe(1)
      expect(record['some']).toBe('field')
    })
    test('should create data', async () => {
      const QUERY = 'INSERT INTO u (test, ololo) VALUES (?, ?)'
      const changes = {
        test: 'some',
        ololo: 'ololo',
      }
      const manager = {
        ...createStubManager(),
        query(query) {
          const { text, values } = query.toParam()
          expect(text).toEqual(QUERY)
          expect(values.length).toBe(2)
          return Promise.resolve([
            {
              insertId: 1,
            },
          ])
        },
      }
      // $FlowIgnore fix for model
      const uRepo = createRepository('u', manager)
      const result = await uRepo.insert(changes)
      expect(result).toEqual(1)
    })
    test('should update data', async () => {
      const QUERY = 'UPDATE u SET id = ?, test = ?, ololo = ? WHERE (id = ?)'
      const changes = {
        id: 1,
        test: 'some',
        ololo: 'ololo',
      }
      const manager = {
        ...createStubManager(),
        query(query) {
          const { text, values } = query.toParam()
          expect(text).toEqual(QUERY)
          expect(values.length).toBe(4)
          return Promise.resolve([{}])
        },
      }
      // $FlowIgnore fix for model
      const uRepo = createRepository('u', manager)
      await uRepo.update(1, changes)
    })
  })
})
