/** @flow */
import type {Connection} from 'mysql2'

export type Model = {
  [key: string]: any,
  save(): Promise<Model>,
  populate(data: {[key: string]: any}): void,
  remove(): Promise<number>
}

export type Criteria = {
  [key: string]: string | number | {
    [key: string]: any
  }
}

export type ColumnMeta = {
  tableName: string,
  columnName: string,
  dataType: string,
  dataLength: number,
  isNullable: number
}

export type Repository = {
  find(id: number): Promise<?Model>,
  findOneBy(criteria: Criteria): Promise<?Model>,
  findBy(criteria: Criteria, orderBy?: {[key: string]: string}, limit?: number, offset?: number): Promise<Array<Model>>,
  create(data: {[key: string]: any}): Model,
  getMetadata(): Promise<{[key: string]: ColumnMeta}>,
  startQuery(alias: ?string): SelectQuery,
  hydrate(data: {[key: string]: any}, isFetched?: boolean): Model,
  insert(changes: {[key: string]: any}): Promise<number>,
  update(selector: number |  {[key: string]: any}, changes: {[key: string]: any}): Promise<number>,
  remove(selector: number |  {[key: string]: any}): Promise<number>
}

export type Relation = {
  tableName: string,
  columnName: string,
  referencedTableName: string,
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
  criteria(criteria: {[key: string]: any}): SelectQuery,
  limit(limit: number): SelectQuery,
  offset(offset: number): SelectQuery,
  toParam(): {text: string, values: Array<any>},
  execute(nestTables?: boolean): Promise<any>
}

export type InsertQuery = {
  into(tableName: string): InsertQuery,
  set(key: string, value: any): InsertQuery,
  toParam(): {text: string, values: Array<any>},
  execute(nestTables?: boolean): Promise<any>
}

export type UpdateQuery = {
  table(tableName: string): UpdateQuery,
  where(condition: string, value?: any): UpdateQuery,
  criteria(criteria: {[key: string]: any}): UpdateQuery,
  limit(limit: number): UpdateQuery,
  offset(offset: number): UpdateQuery,
  set(key: string, value: any): UpdateQuery,
  toParam(): {text: string, values: Array<any>},
  execute(nestTables?: boolean): Promise<any>
}

export type DeleteQuery = {
  from(tableName: string, alias: ?string): DeleteQuery,
  where(condition: string, value?: any): DeleteQuery,
  criteria(criteria: {[key: string]: any}): DeleteQuery,
  limit(limit: number): DeleteQuery,
  offset(offset: number): DeleteQuery,
  toParam(): {text: string, values: Array<any>},
  execute(nestTables?: boolean): Promise<any>
}

export type MetadataManager = {
  hasTable(tableName: string): boolean,
  getTable(tableName: string): {[key: string]: Relation},
  hasAssociation(tableName: string, columnName: string): boolean,
  getColumns(tableName: string): {[key: string]: ColumnMeta},
  ready(): Promise<any>,
  isLoaded(): boolean,
  clear(): void
}

export type Pool = {
  getConnection(): Promise<Connection>,
  query(sql: string | Object, values?: Array<any>): Promise<*>,
  execute(sql: string | Object, values?: Array<any>): Promise<*>
}

export type Manager = {
  connect(): void,
  getRepository(tableName: string): Repository,
  extendRepository(tableName: string, callback: (repo: Repository) => Repository): void,
  getLogger(): ?typeof console,
  ready(): Promise<any>,
  getPool(): Pool,
  clear(): void,
  getMetadataManager(): MetadataManager,
  setMetadataManager(manager: MetadataManager): void,
  getConnection(): Promise<Connection>,
  getConfiguration(): {[key: string]: any},
  query(query: {toParam(): {text: string, values: Array<any>}}): Promise<*>,
  nestQuery(query: SelectQuery): Promise<*>,
  startQuery(): {
    insert(): InsertQuery,
    select(): SelectQuery,
    update(): UpdateQuery,
    delete(): DeleteQuery,
    remove(): DeleteQuery
  }
}
