/** @flow strict */
import Squel, { type QueryBuilderOptions } from 'squel'
import CriteriaBlock from './blocks/CriteriaBlock'
import type { Queries } from '../manager'
import type { DeleteQuery as $DeleteQuery } from '../types'

export class DeleteQuery extends Squel.cls.Delete {
  _manager: Queries

  constructor(
    manager: Queries,
    options: QueryBuilderOptions,
    blocks: ?Array<Squel.cls.Block> = null,
  ) {
    const newBlocks = blocks || [
      new Squel.cls.StringBlock(options, 'DELETE'),
      new Squel.cls.TargetTableBlock(options),
      // $FlowFixMe
      new Squel.cls.FromTableBlock({
        ...(options || {}),
        singleTable: true,
      }),
      new Squel.cls.JoinBlock(options),
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

export default function remove(
  manager: { ...Queries },
  options?: QueryBuilderOptions,
): $DeleteQuery {
  // $FlowFixMe
  return new DeleteQuery(manager, options)
}
