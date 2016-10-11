/** @flow */
import {assert} from 'chai'
import {createRepository} from '../src/createRepository'

const METADATA_QUERY = 'SHOW COLUMNS FROM ??'
const uMetadata = [
  {
    Field: 'id'
  },
  {
    Field: 'some'
  }
]

describe('createRepository', () => {
  it('should find data by id', async () => {
    const QUERY = 'SELECT * FROM u WHERE (id = ?)'
    const manager = {
      query(sql, values) {
        // $FlowIgnore fix for Metadata Query
        if (sql == METADATA_QUERY) {
          return Promise.resolve(uMetadata)
        }
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
  it('should findOne data by criteria', async () => {
    const QUERY = 'SELECT * FROM u WHERE (id = ?) LIMIT 1'
    const manager = {
      query(sql, values) {
        // $FlowIgnore fix for Metadata Query
        if (sql == METADATA_QUERY) {
          return Promise.resolve(uMetadata)
        }
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
    const record = await uRepo.findOneBy({id: 1})
    assert.isNotNull(record)
    if (record == null) return //Flow hack
    assert.propertyVal(record, 'id', 1)
    assert.propertyVal(record, 'some', 'field')
  })
  it('should find data by criteria', async () => {
    const QUERY = 'SELECT * FROM u WHERE (id = ?)'
    const manager = {
      query(sql, values) {
        // $FlowIgnore fix for Metadata Query
        if (sql == METADATA_QUERY) {
          return Promise.resolve(uMetadata)
        }
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
    const result = await uRepo.findBy({id: 1})
    assert.lengthOf(result, 1)
    const [record] = result
    assert.isNotNull(record)
    if (record == null) return //Flow hack
    assert.propertyVal(record, 'id', 1)
    assert.propertyVal(record, 'some', 'field')
  })
  it('should findOne data by hard criteria', async () => {
    const QUERY = 'SELECT * FROM u WHERE (id IN (?, ?)) AND (status != ?) AND (name LIKE ?) AND (foo NOT IN (?, ?))'
    const manager = {
      query(sql, values) {
        // $FlowIgnore fix for Metadata Query
        if (sql == METADATA_QUERY) {
          return Promise.resolve(uMetadata)
        }
        assert.equal(sql, QUERY)
        assert.lengthOf(values, 6)
        assert.include(values || [], 1)
        assert.include(values || [], 2)
        return Promise.resolve([[{
          id: 1,
          some: 'field'
        }]])
      }
    }
    // $FlowIgnore fix for model
    const uRepo = createRepository('u', manager)
    const result = await uRepo.findBy({
      id: {
        $in: [1, 2],
      },
      status: {
        $not: 1
      },
      name: {
        $like: 'test'
      },
      foo: {
        $notIn: [1,2]
      }
    })
    assert.lengthOf(result, 1)
    const [record] = result
    assert.isNotNull(record)
    if (record == null) return //Flow hack
    assert.propertyVal(record, 'id', 1)
    assert.propertyVal(record, 'some', 'field')
  })
})