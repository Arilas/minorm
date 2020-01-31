import Squel, { QueryBuilderOptions, Block } from 'squel'
import CriteriaBlock from './blocks/CriteriaBlock'
import { Queries } from '../manager/parts'
import { UpdateQuery as $UpdateQuery, OkPacket } from '../types'

export class UpdateQuery extends Squel.cls.QueryBuilder {
  private _manager: Queries<any, any> //eslint-disable-line @typescript-eslint/no-explicit-any
  constructor(
    manager: Queries<any, any>, //eslint-disable-line @typescript-eslint/no-explicit-any
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
  manager: Queries<any, any>, //eslint-disable-line @typescript-eslint/no-explicit-any
  options: QueryBuilderOptions | null = {},
): $UpdateQuery {
  // @ts-ignore
  return new UpdateQuery(manager, options)
}
