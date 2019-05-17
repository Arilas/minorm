import Squel, { QueryBuilderOptions, Block } from 'squel'
import { InsertQuery as $InsertQuery, OkPacket } from '../types'
import { Queries } from '../manager/parts'

// @ts-ignore
export class InsertQuery extends Squel.cls.Insert {
  _manager: Queries<any, any> //eslint-disable-line @typescript-eslint/no-explicit-any
  constructor(
    manager: Queries<any, any>, //eslint-disable-line @typescript-eslint/no-explicit-any
    options: QueryBuilderOptions,
    blocks: Block[],
  ) {
    super(options, blocks)

    this._manager = manager
  }

  execute(): Promise<OkPacket> {
    // @ts-ignore
    return this._manager.execute(this).then(([result]) => result)
  }
}

export default function insert(
  manager: Queries<any, any>, //eslint-disable-line @typescript-eslint/no-explicit-any
  options: QueryBuilderOptions | undefined = {},
): $InsertQuery {
  // @ts-ignore
  return new InsertQuery(manager, options)
}
