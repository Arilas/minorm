import Squel, { QueryBuilderOptions, Block } from 'squel'
import CriteriaBlock from './blocks/CriteriaBlock'
import { Queries } from '../manager'
import { DeleteQuery as $DeleteQuery, OkPacket } from '../types'

// @ts-ignore
export class DeleteQuery extends Squel.cls.Delete {
  _manager: Queries<any, any> //eslint-disable-line @typescript-eslint/no-explicit-any

  constructor(
    manager: Queries<any, any>, //eslint-disable-line @typescript-eslint/no-explicit-any
    options: QueryBuilderOptions,
    blocks: Block[] | null,
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

  execute(): Promise<OkPacket> {
    // @ts-ignore
    return this._manager.execute(this).then(([result]) => result)
  }
}

export default function remove(
  manager: Queries<any, any>, //eslint-disable-line @typescript-eslint/no-explicit-any
  options: QueryBuilderOptions | undefined = {},
): $DeleteQuery {
  // @ts-ignore
  return new DeleteQuery(manager, options)
}
