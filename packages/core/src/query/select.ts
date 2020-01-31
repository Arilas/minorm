import Squel, { QueryBuilderOptions, FromTableBlock, Block } from 'squel'
import IncludeBlock from './blocks/IncludeBlock'
import CriteriaBlock from './blocks/CriteriaBlock'
import { Metadata } from '../manager/parts'
import {
  SelectQuery as $SelectQuery,
  BaseRecord,
  Mapper,
  SelectQueryMapper,
  SomeRecord,
} from '../types'
import { createMapper } from '../utils/createMapper'

export class SelectQuery<T extends SomeRecord = BaseRecord> extends Squel.cls
  .QueryBuilder {
  _manager: Metadata<any, any> //eslint-disable-line @typescript-eslint/no-explicit-any
  _mapper: SelectQueryMapper
  _fromTableBlock: FromTableBlock
  constructor(
    manager: Metadata<any, any>, //eslint-disable-line @typescript-eslint/no-explicit-any
    options: QueryBuilderOptions,
    blocks: Block[],
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

  execute(nested?: boolean): Promise<T[]> {
    return (
      this._manager
        .execute(this, { nestTables: !!nested })
        // @ts-ignore It cannot be OkPacket
        .then(([result]) => result)
    )
  }

  getMapper(): Mapper<T> {
    const { _tables } = this._fromTableBlock
    if (_tables.length === 0 || !_tables[0].alias) {
      throw new Error('please use from(table, alias) before calling this')
    }
    this._mapper.setEntryPoint(_tables[0].alias)
    return {
      fetch: async (): Promise<T[]> => {
        const result: T[] = await this.execute(true)
        // @ts-ignore
        return result.map(item => this._mapper.map(item))
      },
    }
  }
}

export default function select<T = BaseRecord>(
  manager: Metadata<any, any>, //eslint-disable-line @typescript-eslint/no-explicit-any
  options: QueryBuilderOptions | null = {},
): $SelectQuery<T> {
  // @ts-ignore
  return new SelectQuery(manager, options)
}
