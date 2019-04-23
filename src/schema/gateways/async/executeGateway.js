/** @flow */
import { createBaseGateway } from '../createBaseGateway'
import type { SchemaToolGateway } from '../../types'
import { APPLY } from './constants'

export function executeGateway(): () => SchemaToolGateway {
  return () => ({
    ...createBaseGateway(),
    getAction() {
      return {
        type: APPLY,
      }
    },
  })
}
