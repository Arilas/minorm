import { createBaseGateway } from './createBaseGateway'
import insert from '../../query/insert'
import { SchemaToolGateway } from '../types'
import { BaseRecord } from '../../types'

export function putGateway(): (
  tableName: string,
  entities: BaseRecord[],
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
