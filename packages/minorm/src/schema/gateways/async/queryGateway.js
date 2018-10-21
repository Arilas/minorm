/** @flow */
import { createBaseGateway } from '../createBaseGateway'
import type {SchemaToolGateway} from '../../types'
import { QUERY } from './constants'

export function queryGateway(): (sql: string) => SchemaToolGateway {
  return sql => ({
    ...createBaseGateway(),
    getAction() {
      return {
        type: QUERY,
        payload: {
          sql
        }
      }
    }
  })
}