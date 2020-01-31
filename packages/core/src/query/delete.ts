import { QueryBuilderOptions, Block, cls } from 'squel'
import CriteriaBlock from './blocks/CriteriaBlock'
import { Queries } from '../manager/parts'
import { DeleteQuery as $DeleteQuery, OkPacket } from '../types'

// @ts-ignore
export class DeleteQuery extends cls.Delete {
  _manager: Queries<any, any> //eslint-disable-line @typescript-eslint/no-explicit-any

  constructor(
    manager: Queries<any, any>, //eslint-disable-line @typescript-eslint/no-explicit-any
    options: QueryBuilderOptions,
    blocks: Block[] | null,
  ) {
    const newBlocks = blocks || [
      new cls.StringBlock(options, 'DELETE'),
      new cls.TargetTableBlock(options),
      new cls.FromTableBlock({
        ...options,
        singleTable: true,
      }),
      new cls.JoinBlock(options),
      new CriteriaBlock(options),
      new cls.OrderByBlock(options),
      new cls.LimitBlock(options),
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
  options: QueryBuilderOptions | null = {},
): $DeleteQuery {
  // @ts-ignore
  return new DeleteQuery(manager, options)
}
