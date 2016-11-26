/** @flow */
import {assert} from 'chai'
import {createModel} from '../../src/createModel'

const uMetadata = {
  id: {
    tableName: 'u',
    dataType: '',
    isNullable: 0,
    dataLength: 0,
    columnName: 'id'
  },
  foo: {
    tableName: 'u',
    dataType: '',
    isNullable: 0,
    dataLength: 0,
    columnName: 'some'
  },
  test: {
    tableName: 'u',
    dataType: '',
    isNullable: 0,
    dataLength: 0,
    columnName: 'test'
  }
}
describe('Unit', () => {
  describe('createModel', () => {
    it('should extend original object with methods', async () => {
      const obj = {
        test: 'some'
      }
      // $FlowIgnore fix for model
      createModel({
        insert(changes) {
          assert.propertyVal(changes, 'test', 'some')
          return Promise.resolve(1)
        },
        update(id, changes) {
          assert.equal(id, 1)
          assert.propertyVal(changes, 'foo', 'bar')
          assert.notProperty(changes, 'id')
          assert.notProperty(changes, 'test')
          assert.notProperty(changes, 'ololo')
          return Promise.resolve(null)
        },
        getMetadata() {
          return Promise.resolve(uMetadata)
        }
      }, obj, false) // $FlowIgnore fix for model
      await obj.save() // $FlowIgnore fix for model
      obj.populate({
        foo: 'bar',
        ololo: 'test'
      })
      // $FlowIgnore fix for model
      await obj.save()
      // $FlowIgnore fix for model
      await obj.save()
    })
  })

})