/** @flow */
import Squel from 'squel'
import type {Manager, InsertQuery as $InsertQuery} from '../types'

export class InsertQuery extends Squel.cls.Insert {
  constructor(manager: Manager, options: any, blocks: ?Array<typeof Squel.cls.QueryBlock> = null) {
    super(options, blocks)

    this._manager = manager
  }

  execute(nested: boolean = false) {
    if (nested) {
      return this._manager.nestQuery(this).then(([result]) => result)
    } else {
      return this._manager.query(this).then(([result]) => result)
    }
  }
}

export default function insert(manager: Manager, options: any): $InsertQuery {
  return new InsertQuery(manager, options)
}
