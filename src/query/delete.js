/** @flow */
import Squel from 'squel'
import CriteriaBlock from './blocks/CriteriaBlock'
import type { Manager } from '../createManager'
import type { DeleteQuery as $DeleteQuery } from '../types'

export class DeleteQuery extends Squel.cls.Delete {
  _manager: Manager

  constructor(
    manager: Manager,
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
    return this._manager.query(this).then(([result]) => result)
  }
}

export default function remove(manager: Manager, options: any): $DeleteQuery {
  // $FlowIgnore
  return new DeleteQuery(manager, options)
}
