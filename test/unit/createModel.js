/** @flow */
import { createModel } from '../../src/createModel'

const uMetadata = {
  id: {
    tableName: 'u',
    dataType: '',
    isNullable: 0,
    dataLength: 0,
    columnName: 'id',
  },
  foo: {
    tableName: 'u',
    dataType: '',
    isNullable: 0,
    dataLength: 0,
    columnName: 'some',
  },
  test: {
    tableName: 'u',
    dataType: '',
    isNullable: 0,
    dataLength: 0,
    columnName: 'test',
  },
}
describe('Unit', () => {
  describe('createModel', () => {
    test('should extend original object with methods', async () => {
      const objRaw = {
        test: 'some',
      }
      let insertCount = 0
      const obj = createModel(
        {
          insert(changes) {
            if (insertCount == 0) {
              expect(changes['test']).toBe('some')
              insertCount = 1
            } else {
              expect(changes['id']).toBe(1)
              expect(changes['test']).toBe('some')
            }
            return Promise.resolve(1)
          },
          update(id, changes) {
            expect(id).toEqual(1)
            expect(changes['foo']).toBe('bar')
            expect('id' in changes).toBeFalsy()
            expect('test' in changes).toBeFalsy()
            expect('ololo' in changes).toBeFalsy()
            return Promise.resolve(1)
          },
          remove(id) {
            expect(id).toEqual(1)
            return Promise.resolve(1)
          },
          getMetadata() {
            return uMetadata
          },
        },
        objRaw,
        false,
      )
      await obj.save()
      obj.populate({
        foo: 'bar',
        ololo: 'test',
      })
      await obj.save()
      await obj.save()
      await obj.remove()
      await obj.save()
    })
  })
})
