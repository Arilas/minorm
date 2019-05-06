/** @flow strict */
import Squel, { type QueryBuilderOptions } from 'squel'
import CriteriaBlock from './blocks/CriteriaBlock'
import type { Queries } from '../manager'
import type { UpdateQuery as $UpdateQuery } from '../types'

export class UpdateQuery extends Squel.cls.QueryBuilder {
  _manager: Queries
  constructor(
    manager: Queries,
    options: QueryBuilderOptions,
    blocks: ?Array<Squel.cls.Block> = null,
  ) {
    const newBlocks = blocks || [
      new Squel.cls.StringBlock(options, 'UPDATE'),
      new Squel.cls.UpdateTableBlock(options),
      new Squel.cls.SetFieldBlock(options),
      new CriteriaBlock(options),
      new Squel.cls.OrderByBlock(options),
      new Squel.cls.LimitBlock(options),
    ]

    super(options, newBlocks)

    this._manager = manager
  }

  execute() {
    return this._manager.execute(this).then(([result]) => result)
  }
}

export default function update(
  manager: { ...Queries },
  options?: QueryBuilderOptions,
): $UpdateQuery {
  // $FlowFixMe
  return new UpdateQuery(manager, options)
}
