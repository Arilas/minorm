import { stub } from 'sinon'
import { withRetry } from '../../../src/utils/withRetry'

describe('Unit', () => {
  describe('Utils', () => {
    describe('withRetry', () => {
      it('should exit without delay when everything fine', async () => {
        const handler = stub().returns(Promise.resolve(1))
        const value = await withRetry(handler)
        expect(value).toEqual(1)
        expect(handler.calledOnce).toBeTruthy()
      })
      it('should retry one time when first attempt was unsuccessful', async () => {
        const handler = stub().returns(Promise.resolve(1))
        handler.withArgs(1).returns(Promise.reject('err'))
        const value = await withRetry(handler)
        expect(value).toEqual(1)
        expect(handler.calledTwice).toBeTruthy()
      })
      it('should return an error when tries is over', async () => {
        const handler = stub().returns(Promise.reject('err'))
        try {
          await withRetry(handler, 5, 20)
          throw new Error('should fail')
        } catch (err) {
          expect(err).toEqual('err')
          expect(handler.callCount).toEqual(5)
        }
      })
      it('should delay between attempts', async () => {
        const handler = stub().returns(Promise.resolve(1))
        handler.withArgs(1).returns(Promise.reject('err'))
        const startTime = Date.now()
        const value = await withRetry(handler, 5, 20)
        const endTime = Date.now()
        expect(value).toEqual(1)
        expect(handler.calledTwice).toBeTruthy()
        expect(endTime - startTime).toBeCloseTo(20, -1.5)
      })

      it('should throw with invalid count of attempts', async () => {
        const handler = stub().throws(new Error('err'))
        try {
          await withRetry(handler, 0, 20)
          throw new Error('should throw')
        } catch (err) {
          expect(err.message).toEqual('Wrong amount of attempts')
          expect(handler.callCount).toEqual(0)
        }
      })
    })
  })
})
