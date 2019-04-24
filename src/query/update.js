/** @flow */
import Squel from 'squel'
import CriteriaBlock from './blocks/CriteriaBlock'
import type { Manager } from '../createManager'
import type { UpdateQuery as $UpdateQuery } from '../types'

export class UpdateQuery extends Squel.cls.QueryBuilder {
  _manager: Manager
  constructor(
    manager: Manager,
    options: any,
    blocks: ?Array<Squel.cls.Block> = null,
  ) {
    blocks = blocks || [
      new Squel.cls.StringBlock(options, 'UPDATE'),
      new Squel.cls.UpdateTableBlock(options),
      new Squel.cls.SetFieldBlock(options),
      new CriteriaBlock(options),
      new Squel.cls.OrderByBlock(options),
      new Squel.cls.LimitBlock(options),
    ]

    super(options, blocks)

    this._manager = manager
  }

  execute() {
    return this._manager.query(this).then(([result]) => result)
  }
}

export default function update(manager: Manager, options: any): $UpdateQuery {
  // $FlowIgnore
  return new UpdateQuery(manager, options)
}
