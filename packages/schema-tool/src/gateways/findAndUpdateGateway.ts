import { createBaseGateway } from './createBaseGateway'
import { updateQuery, Criteria, BaseRecord } from '@minorm/core'
import { SchemaToolGateway } from '../types'

export function findAndUpdateGateway(): (
  tableName: string,
  criteria: Criteria,
  changes: BaseRecord,
) => SchemaToolGateway {
  return (tableName, criteria, changes) => ({
    ...createBaseGateway(),
    getPostQueries() {
      // $FlowFixMe
      const query = updateQuery({})
        .criteria(criteria)
        .table(tableName)
      Object.keys(changes).forEach(key => query.set(key, changes[key]))
      return [query.toString()]
    },
  })
}
