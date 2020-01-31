import { stub } from 'sinon'
import { createModel } from '../../src/createModel'
import { BaseRecord } from '../../src/types'

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
          insert(changes: BaseRecord) {
            if (insertCount == 0) {
              expect(changes['test']).toBe('some')
              insertCount = 1
            } else {
              expect(changes['id']).toBe(1)
              expect(changes['test']).toBe('some')
            }
            return Promise.resolve(1)
          },
          update(id, changes: BaseRecord) {
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
        // @ts-ignore
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

    it('should remove data', async () => {
      // eslint-disable-next-line
      const mutators: any = {
        insert: stub().returns(Promise.resolve(1)),
        update: stub().returns(Promise.resolve(1)),
        remove: stub().returns(Promise.resolve(1)),
        getMetadata: stub().returns(uMetadata),
      }
      const model = createModel(
        mutators,
        {
          id: 1,
        },
        true,
      )
      await model.remove()
      expect(mutators.remove.called).toBeTruthy()
      expect(mutators.remove.args[0][0]).toBe(1)
    })

    it('should populate data', async () => {
      // eslint-disable-next-line
      const mutators: any = {
        insert: stub().returns(Promise.resolve(1)),
        update: stub().returns(Promise.resolve(1)),
        remove: stub().returns(Promise.resolve(1)),
        getMetadata: stub().returns(uMetadata),
      }
      const model = createModel<BaseRecord>(
        mutators,
        {
          id: 1,
        },
        true,
      )
      model.populate({
        foo: 'bar',
        ololo: 'das',
      })
      expect(model.foo).toEqual('bar')
      expect(model.ololo).toEqual('das')
      await model.save()
      expect(mutators.getMetadata.called).toBeTruthy()
      expect(mutators.update.called).toBeTruthy()
      expect(mutators.update.args[0][0]).toBe(1)
      expect(mutators.update.args[0][1]).toMatchObject({
        foo: 'bar',
      })
    })

    it('should not call mutators when data is not changed', async () => {
      // eslint-disable-next-line
      const mutators: any = {
        insert: stub().returns(Promise.resolve(1)),
        update: stub().returns(Promise.resolve(1)),
        remove: stub().returns(Promise.resolve(1)),
        getMetadata: stub().returns(uMetadata),
      }
      const model = createModel<BaseRecord>(
        mutators,
        {
          id: 1,
        },
        true,
      )
      model.bar = 'adfs'
      await model.save()
      expect(mutators.getMetadata.called).toBeTruthy()
      expect(mutators.update.called).toBeFalsy()
    })

    it('should call insert when data is changed and id provided', async () => {
      // eslint-disable-next-line
      const mutators: any = {
        insert: stub().returns(Promise.resolve(1)),
        update: stub().returns(Promise.resolve(1)),
        remove: stub().returns(Promise.resolve(1)),
        getMetadata: stub().returns(uMetadata),
      }
      const model = createModel(
        mutators,
        {
          id: 1,
        },
        false,
      )
      await model.save()
      expect(mutators.getMetadata.called).toBeTruthy()
      expect(mutators.insert.called).toBeTruthy()
      expect(mutators.update.called).toBeFalsy()
    })
    it('should call update when id is changed', async () => {
      // eslint-disable-next-line
      const mutators: any = {
        insert: stub().returns(Promise.resolve(1)),
        update: stub().returns(Promise.resolve(1)),
        remove: stub().returns(Promise.resolve(1)),
        getMetadata: stub().returns(uMetadata),
      }
      const model = createModel(
        mutators,
        {
          id: 1,
        },
        true,
      )
      model.id = 2
      await model.save()
      expect(mutators.getMetadata.called).toBeTruthy()
      expect(mutators.update.called).toBeTruthy()
      expect(mutators.update.args[0][0]).toBe(1)
      expect(mutators.update.args[0][1]).toMatchObject({
        id: 2,
      })
      expect(mutators.insert.called).toBeFalsy()
    })
  })
})
