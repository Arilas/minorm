/** @flow */
// eslint-disable
import type { Connection } from 'mysql2'

export type BaseRecord = {
  id?: ?number
}

export type Model<T: BaseRecord = { [key: string]: any }> = {
    ...T,
  save(): Promise<self>,
  populate(data: { [key: string]: any }): void,
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

export type TableMetadata = {
  [key: string]: ColumnMeta
}

export type Repository<T: BaseRecord = { [key: string]: any }> = {
  find(id: number): Promise<Model<T> | null>,
  findOneBy(criteria: Criteria): Promise<Model<T> | null>,
  findBy(criteria: Criteria, orderBy?: { [key: string]: boolean }, limit?: number, offset?: number): Promise<Array<Model<T>>>,
  create<Q: T>(data: Q): Model<Q>,
  getMetadata(): Promise<TableMetadata>,
  startQuery(alias: ?string): SelectQueryInternal<T>,
  hydrate(data: T, isFetched?: boolean): Model<T>,
  insert(changes: T): Promise<number>,
  update(selector: number | { [key: string]: any }, changes: { [key: string]: any }): Promise<number>,
  remove(selector: number | { [key: string]: any }): Promise<number>
}

export type Relation = {
  tableName: string,
  columnName: string,
  referencedTableName: string,
  referencedColumnName: string
}

export type SelectQueryMapper = {
  setRelation(from: string, alias: string): void,
  setEntryPoint(alias: string): void,
  build(): Object,
  map(rawData: { [key: string]: ?Object }): Object | null
}

export type Mapper<T: BaseRecord = { [key: string]: any }> = {
  fetch(): Promise<Array<{
    ...T,
    [key: string]: any
  }>>
}

declare class SelectQueryInternal<T: BaseRecord = { [key: string]: any }> {
  from(tableName: string, alias: ?string): this,
  join(tableName: string, alias: string, on: string): this,
  left_join(tableName: string, alias: string | null, on: string): this,
  include(fromAlias: string, columnName: string, alias?: string): this,
  tryInclude(fromAlias: string, columnName: string, alias?: string): this,
  field(field: SelectQueryInternal<>, alias?: string): this,
  field(field: string, alias?: string): this,
  where(condition: string, ...values?: Array<any>): this,
  criteria(criteria: { [key: string]: any }): this,
  limit(limit: number): this,
  offset(offset: number): this,
  order(field: string, direction?: boolean): this,
  group(field: string): this,
  toParam(): { text: string, values: Array<any> },
  execute(): Promise<Array<T>>,
  execute(nestTables: true): Promise<Array<{ [key: string]: { [key: string]: any } }>>,
  execute(nestTables: false): Promise<Array<T>>,
  getMapper(): Mapper<T>
}

export type SelectQuery<T: BaseRecord = { [key: string]: any }> = SelectQueryInternal<T>

export type InsertQuery = {
  into(tableName: string): InsertQuery,
  set(key: string, value: any): InsertQuery,
  setFields(entity: { [key: string]: any }): InsertQuery,
  setFieldsRows(entities: Array<{ [key: string]: any }>): InsertQuery,
  toParam(): { text: string, values: Array<any> },
  execute(nestTables?: boolean): Promise<any>
}

export type UpdateQuery = {
  table(tableName: string): UpdateQuery,
  where(condition: string, value?: any): UpdateQuery,
  criteria(criteria: { [key: string]: any }): UpdateQuery,
  limit(limit: number): UpdateQuery,
  offset(offset: number): UpdateQuery,
  set(key: string, value: any): UpdateQuery,
  toParam(): { text: string, values: Array<any> },
  execute(nestTables?: boolean): Promise<any>
}

export type DeleteQuery = {
  from(tableName: string, alias: ?string): DeleteQuery,
  where(condition: string, value?: any): DeleteQuery,
  criteria(criteria: { [key: string]: any }): DeleteQuery,
  limit(limit: number): DeleteQuery,
  offset(offset: number): DeleteQuery,
  toParam(): { text: string, values: Array<any> },
  execute(nestTables?: boolean): Promise<any>
}

export type MetadataManager = {
  hasTable(tableName: string): boolean,
  getTable(tableName: string): { [key: string]: Relation },
  hasAssociation(tableName: string, columnName: string): boolean,
  getColumns(tableName: string): { [key: string]: ColumnMeta },
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
  getRepository<T: BaseRecord>(tableName: string): Repository<T>,
  extendRepository(tableName: string, callback: (repo: Repository<>) => Repository<>): void,
  setRepositoryFactory(factory: (tableName: string, manager: Manager) => Repository<>): void,
  getLogger(): ?typeof console,
  ready(): Promise<any>,
  getPool(): Pool,
  clear(): void,
  getMetadataManager(): MetadataManager,
  setMetadataManager(manager: MetadataManager): void,
  getConnection(): Promise<Connection>,
  getConfiguration(): { [key: string]: any },
  query(query: { toParam(): { text: string, values: Array<any> } }): Promise<*>,
  nestQuery(query: SelectQueryInternal<>): Promise<*>,
  startQuery(): {
    insert(): InsertQuery,
    select<T: BaseRecord>(): SelectQueryInternal<T>,
    update(): UpdateQuery,
    delete(): DeleteQuery,
    remove(): DeleteQuery
  }
}
