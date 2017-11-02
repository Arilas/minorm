/** @flow */
import Squel from 'squel'
import IncludeBlock from './blocks/IncludeBlock'
import CriteriaBlock from './blocks/CriteriaBlock'
import type {Manager, SelectQuery as $SelectQuery} from '../types'
import { createMapper } from '../utils/createMapper'

export class SelectQuery extends Squel.cls.QueryBuilder {
  constructor(manager: Manager, options: any, blocks: ?Array<typeof Squel.cls.QueryBlock> = null) {
    const mapper = createMapper()
    // For include functionality we need fromTableBlock inside IncludeBlock
    const fromTableBlock = new Squel.cls.FromTableBlock(options)
    blocks = blocks || [
      new Squel.cls.StringBlock(options, 'SELECT'),
      new Squel.cls.FunctionBlock(options),
      new Squel.cls.DistinctBlock(options),
      new Squel.cls.GetFieldBlock(options),
      fromTableBlock,
      new IncludeBlock(manager, fromTableBlock, options, mapper),
      new CriteriaBlock(options),
      new Squel.cls.GroupByBlock(options),
      new Squel.cls.HavingBlock(options),
      new Squel.cls.OrderByBlock(options),
      new Squel.cls.LimitBlock(options),
      new Squel.cls.OffsetBlock(options),
      new Squel.cls.UnionBlock(options),
    ]

    super(options, blocks)

    this._manager = manager
    this._mapper = mapper
    this._fromTableBlock = fromTableBlock
  }

  execute(nested: boolean = false) {
    if (nested) {
      return this._manager.nestQuery(this).then(([result]) => result)
    } else {
      return this._manager.query(this).then(([result]) => result)
    }
  }

  getMapper() {
    this._mapper.setEntryPoint(this._fromTableBlock._tables[0].alias)
    return {
      fetch: async () => {
        // const result = 
      }
    }
  }
}

export default function select(manager: Manager, options: any): $SelectQuery {
  return new SelectQuery(manager, options)
}
