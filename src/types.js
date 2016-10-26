/** @flow */
import type {Connection} from 'mysql2'

export type Model = {
  [key: string]: any,
  save(): Promise<Model>,
  populate(data: {[key: string]: any}): void
}

export type Criteria = {
  [key: string]: string | number | {
    [key: string]: any
  }
}

export type Repository = {
  find(id: number): Promise<?Model>,
  findOneBy(criteria: Criteria): Promise<?Model>,
  findBy(criteria: Criteria, orderBy?: {[key: string]: string}, limit?: number, offset?: number): Promise<Array<Model>>,
  create(data: {[key: string]: any}): Model,
  getMetadata(): Promise<ColumnsMeta>,
  startQuery(alias: ?string): SelectQuery,
  hydrate(data: {[key: string]: any}, isFetched?: boolean): Model,
  _save(changes: {[key: string]: any}, id?: number): Promise<number|string|null>
}

export type ColumnsMeta = {
  [key: string]: {
    Field: string,
    Type: string,
    Null: string,
    Key: string,
    Default: string,
    Extra: string
  }
}

export type Relation = {
  tableName: string,
  columnName: string,
  referencedColumnName: string
}

export type SelectQuery = {
  from(tableName: string, alias: ?string): SelectQuery,
  join(tableName: string, alias: string, on: string): SelectQuery,
  left_join(tableName: string, alias: string, on: string): SelectQuery,
  include(fromAlias: string, columnName: string, alias?: string): SelectQuery,
  tryInclude(fromAlias: string, columnName: string, alias?: string): SelectQuery,
  field(field: string): SelectQuery,
  where(condition: string, value?: any): SelectQuery,
  limit(limit: number): SelectQuery,
  offset(offset: number): SelectQuery,
  toParam(): {text: string, values: Array<any>}
}

export type MetadataManager = {
  hasTable(tableName: string): boolean,
  getTable(tableName: string): {[key: string]: Relation},
  hasAssociation(tableName: string, columnName: string): boolean,
  setAssociations(tableName: string, relations: Array<Relation>): void,
  clear(): void
}

export type Manager = {
  connect(): void,
  getRepository(tableName: string): Repository,
  extendRepository(tableName: string, callback: (repo: Repository) => Repository): void,
  getLogger(): ?typeof console,
  // getPool(): Pool,
  clear(): void,
  getMetadataManager(): MetadataManager,
  setMetadataManager(manager: MetadataManager): void,
  getConnection(): Connection,
  query(sql: string | SelectQuery, values?: Array<any>): Promise<*>,
  nestQuery(sql: {text: string, values: Array<any>} | SelectQuery): Promise<*>,
  startQuery(): {select(): SelectQuery}
}
