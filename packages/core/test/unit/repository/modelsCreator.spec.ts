import { createManager } from '../../../src'
import { createFakePool } from '../fixtures/connectionManager'

describe('Unit', () => {
  describe('Repository', () => {
    describe('modelsCreator', () => {
      const faker = createFakePool()
      const manager = createManager(faker.pool)
      beforeAll(async () => {
        faker.inject()

        await manager.ready()
      })

      it('should hydrate unsaved object and make it dirty', () => {
        const repo = manager.getRepository('users')
        const model = repo.hydrate({ foo: 'test', createdAt: 'fsdsf' })
        expect(model.isDirty()).toBeTruthy()
        expect(model.getChanges()).toMatchObject({ createdAt: 'fsdsf' })
      })

      it('should hydrate saved object', () => {
        const repo = manager.getRepository('users')
        const model = repo.hydrate({ id: 'test', createdAt: 'fsdsf' }, true)
        expect(model.isDirty()).toBeFalsy()
        expect(model.getChanges()).toMatchObject({})
      })

      it('should create model without any incoming object', () => {
        const repo = manager.getRepository('users')
        const model = repo.create()
        expect(model.isDirty()).toBeTruthy()
        expect(model.getChanges()).toMatchObject({})
      })

      it('should create model and make it dirty', () => {
        const repo = manager.getRepository('users')
        const model = repo.create({ foo: 'test', createdAt: 'fsdsf' })
        expect(model.isDirty()).toBeTruthy()
        expect(model.getChanges()).toMatchObject({ createdAt: 'fsdsf' })
      })

      afterAll(async () => {
        await manager.clear()
      })
    })
  })
})
