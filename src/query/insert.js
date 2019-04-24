/** @flow strict */
import Squel, { type QueryBuilderOptions } from 'squel'
import type { InsertQuery as $InsertQuery } from '../types'
import type { Queries } from '../manager'

export class InsertQuery extends Squel.cls.Insert {
  _manager: Queries
  constructor(
    manager: Queries,
    options: QueryBuilderOptions,
    blocks?: Array<Squel.cls.Block>,
  ) {
    // $FlowIgnore
    super(options, blocks)

    this._manager = manager
  }

  execute() {
    return this._manager.execute(this).then(([result]) => result)
  }
}

export default function insert(
  manager: { ...Queries },
  options?: QueryBuilderOptions,
): $InsertQuery {
  // $FlowIgnore
  return new InsertQuery(manager, options)
}
