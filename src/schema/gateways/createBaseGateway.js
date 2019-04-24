/** @flow strict */
import type { SchemaToolGateway } from '../types'

export function createBaseGateway(): SchemaToolGateway {
  return {
    getApi() {
      return null
    },
    getAction() {
      return null
    },
    getPreQueries() {
      return []
    },
    getAddQueries() {
      return []
    },
    getDropQueries() {
      return []
    },
    getDropAlterQueries() {
      return []
    },
    getAddAlterQueries() {
      return []
    },
    getPostQueries() {
      return []
    },
  }
}
