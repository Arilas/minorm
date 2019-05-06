/** @flow strict */
import { createBaseGateway } from './createBaseGateway'
import insert from '../../query/insert'
import type { SchemaToolGateway } from '../types'
import type { BaseRecord } from '../../types'

export function putGateway(): (
  tableName: string,
  entities: Array<BaseRecord>,
) => SchemaToolGateway {
  return (tableName, entities) => ({
    ...createBaseGateway(),
    getPostQueries() {
      return [
        // $FlowFixMe
        insert({})
          .into(tableName)
          .setFieldsRows(entities)
          .toString(),
      ]
    },
  })
}
