// eslint-disable-next-line
import { Delete, Update, Select, Insert } from 'squel'

export interface SomeRecord {
  id?: any // eslint-disable-line
}

export interface BaseRecord extends SomeRecord {
  id?: number | string | null | undefined
  [key: string]: any // eslint-disable-line
}

export interface Criteria {
  [key: string]:
    | string
    | number
    | {
        [key: string]:
          | string
          | number
          | null
          | void
          | (string | number | null | void)[]
      }
}

export interface SelectQueryMapper {
  setRelation(from: string, alias: string): void
  setEntryPoint(alias: string): void
  build(): BaseRecord
  map(rawData: { [key: string]: BaseRecord | null }): BaseRecord | null
}

export interface Mapper<T extends SomeRecord> {
  fetch(): Promise<T[]>
}

export interface SelectQuery<T = BaseRecord> extends Select {
  include(fromAlias: string, columnName: string, alias?: string): this
  tryInclude(fromAlias: string, columnName: string, alias?: string): this
  criteria(criteria: Criteria): this
  execute(): Promise<T[]>
  execute(
    nestTables: true,
  ): Promise<{ [key: string]: { [key: string]: BaseRecord } }[]>
  execute(nestTables: false): Promise<T[]>
  getMapper(): Mapper<T>
}

export interface InsertQuery extends Insert {
  execute(
    nestTables?: boolean,
  ): Promise<{
    insertId?: string | number
    affectedRows?: number
    changedRows?: number
  }>
}

export interface UpdateQuery extends Update {
  criteria(criteria: Criteria): this
  execute(
    nestTables?: boolean,
  ): Promise<{
    insertId?: string | number
    affectedRows?: number
    changedRows?: number
  }>
}

export interface DeleteQuery extends Delete {
  criteria(criteria: Criteria): this
  execute(): Promise<{
    insertId?: string | number
    affectedRows?: number
    changedRows?: number
  }>
}
