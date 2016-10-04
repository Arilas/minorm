/** @flow */
import {assert} from 'chai'
import {createModel} from '../src/createModel'

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
          return Promise.resolve(null)
        } else {
          assert.propertyVal(changes, 'test', 'some')
          return Promise.resolve(1)
        }
      }
    }, obj, false) // $FlowIgnore fix for model
    await obj.save() // $FlowIgnore fix for model
    obj.populate({ 
      foo: 'bar'
    })
    // $FlowIgnore fix for model
    await obj.save()
    // $FlowIgnore fix for model
    await obj.save()
  })
})