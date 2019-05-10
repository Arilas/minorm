import { createBaseGateway } from './createBaseGateway'
import { SchemaToolGateway } from '../types'
import { BaseRecord, insertQuery } from '@minorm/core'

export function putGateway(): (
  tableName: string,
  entities: BaseRecord[],
) => SchemaToolGateway {
  return (tableName, entities) => ({
    ...createBaseGateway(),
    getPostQueries() {
      return [
        insertQuery({})
          .into(tableName)
          .setFieldsRows(entities)
          .toString(),
      ]
    },
  })
}
