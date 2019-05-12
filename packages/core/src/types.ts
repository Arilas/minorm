// eslint-disable-next-line
import { Delete, Update, Select, Insert, QueryBuilder } from 'squel'
import { Relation, ColumnMeta } from './utils/createMetadataManager'

export interface SomeRecord {
  id?: any // eslint-disable-line
}

export interface BaseRecord extends SomeRecord {
  id?: number | string | null | undefined
  [key: string]: any // eslint-disable-line
}

export interface RowDataPacket {
  constructor: {
    name: 'RowDataPacket'
  }
  [column: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
  [column: number]: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface OkPacket {
  constructor: {
    name: 'OkPacket'
  }
  fieldCount: number
  affectedRows: number
  changedRows: number
  insertId: number
  serverStatus: number
  warningCount: number
  message: string
  protocol41: boolean
}

export type SimpleValue = string | number | boolean | null | undefined

export interface QueryOptions {
  /**
   * The SQL for the query
   */
  sql: string

  /**
   * The values for the query
   */
  values?: SimpleValue | SimpleValue[] | { [param: string]: SimpleValue }
}

export interface Adapter {
  init(): void
  end(): Promise<void>

  query(
    query: QueryBuilder,
    options?: Partial<QueryOptions>,
  ): Promise<[RowDataPacket[][] | RowDataPacket[] | OkPacket, any]> //eslint-disable-line @typescript-eslint/no-explicit-any
  execute(
    query: QueryBuilder,
    options?: Partial<QueryOptions>,
  ): Promise<[RowDataPacket[][] | RowDataPacket[] | OkPacket, any]> //eslint-disable-line @typescript-eslint/no-explicit-any
  _execute<
    T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[]
  >(
    options: QueryOptions,
  ): Promise<[T, any]> //eslint-disable-line @typescript-eslint/no-explicit-any
  getRelations(): Promise<Relation[]>
  getColumns(): Promise<ColumnMeta[]>
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
