/** @flow */
import {assert} from 'chai'
import {createRepository} from '../src/createRepository'

describe('createRepository', () => {
  it('should find data by id', async () => {
    const QUERY = 'SELECT * FROM u WHERE (id = ?)'
    const manager = {
      query(sql, values) {
        assert.equal(sql, QUERY)
        assert.lengthOf(values, 1)
        assert.include(values || [], 1)
        return Promise.resolve([[{
          id: 1,
          some: 'field'
        }]])
      }
    }
    // $FlowIgnore fix for model
    const uRepo = createRepository('u', manager)
    const record = await uRepo.find(1)
    assert.isNotNull(record)
    if (record == null) return //Flow hack
    assert.propertyVal(record, 'id', 1)
    assert.propertyVal(record, 'some', 'field')
  })
})