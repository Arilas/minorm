/** @flow */
import {assert} from 'chai'
import {createModel} from '../src/createModel'

const uMetadata = {
  id: {
    columnName: 'id'
  },
  foo: {
    columnName: 'some'
  },
  test: {
    columnName: 'test'
  }
}

describe('createModel', () => {
  it('should extend original object with methods', async () => {
    const obj = { 
      test: 'some'
    }
    // $FlowIgnore fix for model
    createModel({
      _save(changes, id) {
        if (id) {
          assert.equal(id, 1)
          assert.propertyVal(changes, 'foo', 'bar')
          assert.notProperty(changes, 'id')
          assert.notProperty(changes, 'test')
          assert.notProperty(changes, 'ololo')
          return Promise.resolve(null)
        } else {
          assert.propertyVal(changes, 'test', 'some')
          return Promise.resolve(1)
        }
      },
      getMetadata() {
        // $FlowIgnore fix for model
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