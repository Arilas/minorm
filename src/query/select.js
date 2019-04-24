/** @flow strict */
import Squel, { type QueryBuilderOptions } from 'squel'
import IncludeBlock from './blocks/IncludeBlock'
import CriteriaBlock from './blocks/CriteriaBlock'
import type { Metadata } from '../manager'
import type {
  SelectQuery as $SelectQuery,
  BaseRecord,
  Mapper,
  SelectQueryMapper,
} from '../types'
import { createMapper } from '../utils/createMapper'

export class SelectQuery<T: BaseRecord> extends Squel.cls.QueryBuilder {
  _manager: Metadata
  _mapper: SelectQueryMapper
  _fromTableBlock: Squel.cls.FromTableBlock
  constructor(
    manager: Metadata,
    options: QueryBuilderOptions,
    blocks: ?Array<Squel.cls.Block> = null,
  ) {
    const mapper = createMapper()
    // For include functionality we need fromTableBlock inside IncludeBlock
    const fromTableBlock = new Squel.cls.FromTableBlock(options)
    const newBlocks = blocks || [
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

    super(options, newBlocks)

    this._manager = manager
    this._mapper = mapper
    this._fromTableBlock = fromTableBlock
  }

  execute(
    nested?: boolean,
  ): Promise<Array<T>> | Promise<Array<{ [key: string]: ?BaseRecord }>> {
    return this._manager
      .execute(this, { nestTables: !!nested })
      .then(([result]) => result)
  }

  getMapper(): Mapper<T> {
    const { _tables } = this._fromTableBlock
    if (_tables.length === 0 || !_tables[0].alias) {
      throw new Error('please use from(table, alias) before calling this')
    }
    this._mapper.setEntryPoint(_tables[0].alias)
    return {
      fetch: async (): Promise<
        Array<{
          ...T,
          [key: string]: BaseRecord,
        }>,
      > => {
        // $FlowIgnore
        const result: Array<{ [key: string]: ?Object }> = await this.execute(
          true,
        )
        // $FlowIgnore
        return result.map(item => this._mapper.map(item))
      },
    }
  }
}

export default function select<T: BaseRecord>(
  manager: { ...Metadata },
  options?: QueryBuilderOptions,
): $SelectQuery<T> {
  // $FlowIgnore
  return new SelectQuery(manager, options)
}
