import Squel, { QueryBuilderOptions, Block } from 'squel'
import { InsertQuery as $InsertQuery } from '../types'
import { Queries } from '../manager'
import { OkPacket } from '../connectionManager'

// @ts-ignore
export class InsertQuery extends Squel.cls.Insert {
  _manager: Queries
  constructor(manager: Queries, options: QueryBuilderOptions, blocks: Block[]) {
    super(options, blocks)

    this._manager = manager
  }

  execute(): Promise<OkPacket> {
    // @ts-ignore
    return this._manager.execute(this).then(([result]) => result)
  }
}

export default function insert(
  manager: Queries,
  options: QueryBuilderOptions | undefined = {},
): $InsertQuery {
  // @ts-ignore
  return new InsertQuery(manager, options)
}
