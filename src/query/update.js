/** @flow */
import Squel from 'squel'
import CriteriaBlock from './blocks/CriteriaBlock'
import type { Manager, UpdateQuery as $UpdateQuery } from '../types'

export class UpdateQuery extends Squel.cls.QueryBuilder {
  constructor(
    manager: Manager,
    options: any,
    blocks: ?Array<typeof Squel.cls.QueryBlock> = null,
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
  return new UpdateQuery(manager, options)
}
