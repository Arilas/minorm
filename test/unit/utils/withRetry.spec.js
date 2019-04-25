/** @flow */
import sinon from 'sinon'
import { withRetry } from '../../../src/utils/withRetry'

describe('Unit', () => {
  describe('Utils', () => {
    describe('withRetry', () => {
      it('should exit without delay when everything fine', async () => {
        // $FlowIgnore
        const handler: () => Promise<1> = sinon
          .stub()
          .returns(Promise.resolve(1))
        const value = await withRetry(handler)
        expect(value).toEqual(1)
        expect(handler.calledOnce).toBeTruthy()
      })
      it('should retry one time when first attempt was unsuccessful', async () => {
        // $FlowIgnore
        const handler: () => Promise<1> = sinon
          .stub()
          .returns(Promise.resolve(1))
        handler.withArgs(1).returns(Promise.reject('err'))
        const value = await withRetry(handler)
        expect(value).toEqual(1)
        expect(handler.calledTwice).toBeTruthy()
      })
      it('should return an error when tries is over', async () => {
        // $FlowIgnore
        const handler: () => Promise<1> = sinon
          .stub()
          .returns(Promise.reject('err'))
        try {
          await withRetry(handler, 5, 20)
          throw new Error('should fail')
        } catch (err) {
          expect(err).toEqual('err')
          expect(handler.callCount).toEqual(5)
        }
      })
      it('should delay between attemps', async () => {
        // $FlowIgnore
        const handler: () => Promise<1> = sinon
          .stub()
          .returns(Promise.resolve(1))
        handler.withArgs(1).returns(Promise.reject('err'))
        const startTime = new Date() * 1
        const value = await withRetry(handler, 5, 20)
        const endTime = new Date() * 1
        expect(value).toEqual(1)
        expect(handler.calledTwice).toBeTruthy()
        expect(endTime - startTime).toBeCloseTo(20, -1.5)
      })
    })
  })
})
