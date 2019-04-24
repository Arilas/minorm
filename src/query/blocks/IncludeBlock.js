/** @flow */
import Squel from 'squel'
import type { Manager } from '../../createManager'
import type { Relation, SelectQueryMapper } from '../../types'

export default class IncludeBlock extends Squel.cls.JoinBlock {
  _manager: Manager
  _mapper: SelectQueryMapper
  _fromTableBlock: Squel.cls.FromTableBlock
  constructor(
    manager: Manager,
    fromTableBlock: Squel.cls.FromTableBlock,
    options: any,
    mapper: SelectQueryMapper,
  ) {
    super(options)

    this._manager = manager
    this._mapper = mapper
    this._fromTableBlock = fromTableBlock
  }

  _prepareJoin(fromAlias: string, columnName: string, alias?: string) {
    if (!alias) {
      alias = columnName.replace('_id', '')
    }
    const tables = [
      ...this._fromTableBlock._tables, //FROM part
      ...this._joins, //JOIN part
    ]
    const table = tables.filter(table => table.alias == fromAlias)
    if (!table.length) {
      throw new Error(`${fromAlias} not found in query`)
    }
    const originTableName: string = table[0].table.toString()
    if (
      !this._manager.getMetadataManager().hasTable(originTableName) ||
      !this._manager
        .getMetadataManager()
        .getTable(originTableName)
        .relations.hasOwnProperty(columnName)
    ) {
      const msg = `Foreign key ${columnName} is not found in ${originTableName}. Try to get Repository for ${originTableName} to load relations.`
      throw new Error(msg)
    }
    this._mapper.setRelation(fromAlias, alias)
    const relation: Relation = this._manager
      .getMetadataManager()
      .getTable(originTableName).relations[columnName]
    const onPart = `${alias}.${relation.referencedColumnName} = ${fromAlias}.${
      relation.columnName
    }`
    return [relation.referencedTableName, alias, onPart]
  }

  include(fromAlias: string, columnName: string, alias?: string) {
    this.join(...this._prepareJoin(fromAlias, columnName, alias))
  }

  tryInclude(fromAlias: string, columnName: string, alias?: string) {
    this.left_join(...this._prepareJoin(fromAlias, columnName, alias))
  }
}
