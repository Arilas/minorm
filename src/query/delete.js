/** @flow */
import Squel from 'squel'
import CriteriaBlock from './blocks/CriteriaBlock'
import type { Queries } from '../manager'
import type { DeleteQuery as $DeleteQuery } from '../types'

export class DeleteQuery extends Squel.cls.Delete {
  _manager: Queries

  constructor(
    manager: Queries,
    options: any,
    blocks: ?Array<Squel.cls.Block> = null,
  ) {
    blocks = blocks || [
      new Squel.cls.StringBlock(options, 'DELETE'),
      new Squel.cls.TargetTableBlock(options),
      new Squel.cls.FromTableBlock({
        ...options,
        singleTable: true,
      }),
      new Squel.cls.JoinBlock(options),
      new CriteriaBlock(options),
      new Squel.cls.OrderByBlock(options),
      new Squel.cls.LimitBlock(options),
    ]

    super(options, blocks)

    this._manager = manager
  }

  criteria: (criteria: { [key: string]: any }) => DeleteQuery

  execute() {
    return this._manager.execute(this).then(([result]) => result)
  }
}

export default function remove(
  manager: { ...Queries },
  options: any,
): $DeleteQuery {
  // $FlowIgnore
  return new DeleteQuery(manager, options)
}
