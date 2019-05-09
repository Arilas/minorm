import Squel, { QueryBuilderOptions, Block } from 'squel'
import CriteriaBlock from './blocks/CriteriaBlock'
import { Queries } from '../manager'
import { UpdateQuery as $UpdateQuery } from '../types'
import { OkPacket } from '../connectionManager'

export class UpdateQuery extends Squel.cls.QueryBuilder {
  private _manager: Queries
  constructor(
    manager: Queries,
    options: QueryBuilderOptions,
    blocks: Block[] | undefined,
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

  execute(): Promise<OkPacket> {
    // @ts-ignore
    return this._manager.execute(this).then(([result]) => result)
  }
}

export default function update(
  manager: Queries,
  options: QueryBuilderOptions | undefined = {},
): $UpdateQuery {
  // @ts-ignore
  return new UpdateQuery(manager, options)
}
