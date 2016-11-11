/** @flow */
import Squel from 'squel'
import type {Relation, Manager, SelectQuery as $SelectQuery} from '../types'

class IncludeBlock extends Squel.cls.JoinBlock {

  constructor(manager: Manager, fromTableBlock: typeof Squel.cls.FromTableBlock, options: any) {
    super(options)

    this._manager = manager
    this._fromTableBlock = fromTableBlock
  }

  _prepareJoin(fromAlias: string, columnName: string, alias?: string) {
    if (!alias) {
      alias = columnName.replace('_id', '')
    }
    const tables = [
      ...this._fromTableBlock._tables, //FROM part
      ...this._joins //JOIN part
    ]
    const table = tables.filter(table => table.alias == fromAlias)
    if (!table.length) {
      throw new Error(`${fromAlias} not found in query`)
    }
    const originTableName = table[0].table
    if (
      !this._manager.getMetadataManager().hasTable(originTableName)
      || !this._manager.getMetadataManager().getTable(originTableName).hasOwnProperty(columnName)
    ) {
      const msg = `Foreign key ${columnName} is not found in ${originTableName}. Try to get Repository for ${originTableName} to load relations.`
      throw new Error(msg)
    }
    const relation: Relation = this._manager.getMetadataManager().getTable(originTableName)[columnName]
    const onPart = `${alias}.${relation.referencedColumnName} = ${fromAlias}.${relation.columnName}`
    return [relation.referencedTableName, alias, onPart]
  }

  include(fromAlias: string, columnName: string, alias?: string) {
    this.join(...this._prepareJoin(fromAlias, columnName, alias))
  }

  tryInclude(fromAlias: string, columnName: string, alias?: string) {
    this.left_join(...this._prepareJoin(fromAlias, columnName, alias))
  }
}

class CriteriaBlock extends Squel.cls.WhereBlock {
  criteria(criteria) {
    Object.keys(criteria).map(key => {
      if (
        ['string', 'number'].indexOf(typeof criteria[key]) != -1
      ) {
        this.where(
          `${key} = ?`,
          criteria[key]
        )
      } else if (typeof criteria[key] == 'object') {
        const operator = Object.keys(criteria[key])[0]
        switch(operator) {
          case '$in': 
            this.where(
              `${key} IN ?`,
              criteria[key][operator]
            )
            break
          case '$not':
            this.where(
              `${key} != ?`,
              criteria[key][operator]
            )
            break
          case '$notIn': 
            this.where(
              `${key} NOT IN ?`,
              criteria[key][operator]
            )
            break
          case '$like':
            this.where(
              `${key} LIKE ?`,
              criteria[key][operator]
            )
            break
        }
      }
    })
  }
}

export class SelectQuery extends Squel.cls.QueryBuilder {
  constructor(manager: Manager, options: any, blocks: ?Array<typeof Squel.cls.QueryBlock> = null) {
    // For include functionality we need fromTableBlock inside IncludeBlock
    const fromTableBlock = new Squel.cls.FromTableBlock(options)
    blocks = blocks || [
      new Squel.cls.StringBlock(options, 'SELECT'),
      new Squel.cls.FunctionBlock(options),
      new Squel.cls.DistinctBlock(options),
      new Squel.cls.GetFieldBlock(options),
      fromTableBlock,
      new IncludeBlock(manager, fromTableBlock, options),
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
  }

  execute(nested: boolean = false) {
    if (nested) {
      return this._manager.nestQuery(this).then(([result]) => result)
    } else {
      return this._manager.query(this).then(([result]) => result)
    }
  }
}

export default function select(manager: Manager, options: any): $SelectQuery {
  return new SelectQuery(manager, options)
}
