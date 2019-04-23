/** @flow */
import { createBaseGateway } from './createBaseGateway'
import insert from '../../query/insert'
import type { SchemaToolGateway } from '../types'

export function putGateway(): (
  tableName: string,
  entities: Object,
) => SchemaToolGateway {
  return (tableName, entities) => ({
    ...createBaseGateway(),
    getPostQueries() {
      return [
        // $FlowIgnore
        insert({})
          .into(tableName)
          .setFieldsRows(entities)
          .toString(),
      ]
    },
  })
}
