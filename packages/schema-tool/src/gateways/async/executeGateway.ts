import { createBaseGateway } from '../createBaseGateway'
import { SchemaToolGateway } from '../../types'
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
