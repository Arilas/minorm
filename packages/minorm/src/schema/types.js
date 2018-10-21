/** @flow */
import type {Criteria} from '../types'

export type SchemaTool = {
  setSchemaInit(handler: Migration): void,
  initSchema(): Promise<any>,
  dropSchema(): Promise<any>,
  getMigrationManager(): MigrationManager
}

export type SchemaToolContext = {
  table(tableName: string, callback: (ctx: SchemaToolCreateTableContext) => void): SchemaToolGateway,
  use(tableName: string, callback: (ctx: SchemaToolCreateTableContext) => void): SchemaToolGateway,
  dropTable(tableName: string): SchemaToolGateway,
  put(tableName: string, entities: Array<{[key: string]: any}>): SchemaToolGateway,
  addSql(sql: string): SchemaToolGateway,
  findAndUpdate(tableName: string, criteria: Criteria, changes: Object): SchemaToolGateway,
  asyncExecute(): SchemaToolGateway,
  asyncQuery(sql: string): SchemaToolGateway
}

export type SchemaToolGatewayApi = {
  lineAdd(line: {toString(): string} | string): void,
  lineDrop(line: {toString(): string} | string): void,
  alterAdd(line: {toString(): string} | string): void,
  alterDrop(line: {toString(): string} | string): void
}

export type SchemaToolGateway = {
  getApi(): ?SchemaToolGatewayApi,
  getAction(): ?Object,
  getPreQueries(): Array<string>,
  getAddQueries(): Array<string>,
  getDropQueries(): Array<string>,
  getAddAlterQueries(): Array<string>,
  getDropAlterQueries(): Array<string>,
  getPostQueries(): Array<string>
}

export type SchemaToolCreateTableContext = {
  column(columnName: string): SchemaToolColumnContext,
  id(): SchemaToolColumnContext,
  refColumn(columnName: string, targetTableName: string, targetColumnName?: string): SchemaToolColumnContext,
  createdAndModified(): SchemaToolColumnContext,
  dropColumn(columnName: string): void,
  dropIndex(indexName: string): void,
  dropRef(indexName: string): void,
  dropColumnRef(columnName: string): void,
  dropColumnUnique(columnName: string): void,
  dropColumnIndex(columnName: string): void,
  dropColumnKey(columnName: string): void,
  ref(columnName: string, referencedTableName: string, referencedColumnName: string): void,
  unique(columnName: string, indexName?: string): void,
  index(columnName: string, indexName?: string): void,
  key(columnName: string, indexName?: string): void
}

export type SchemaToolColumnContext = {
  string(len?: number): SchemaToolColumnContext,
  text(): SchemaToolColumnContext,
  longText(): SchemaToolColumnContext,
  bool(): SchemaToolColumnContext,
  tinyInt(len?: number): SchemaToolColumnContext,
  int(len?: number): SchemaToolColumnContext,
  date(): SchemaToolColumnContext,
  dateTime(): SchemaToolColumnContext,
  time(): SchemaToolColumnContext,
  notNull(): SchemaToolColumnContext,
  primary(): SchemaToolColumnContext,
  unsigned(): SchemaToolColumnContext,
  autoIncrement(): SchemaToolColumnContext,
  defaultValue(value: any): SchemaToolColumnContext,
  build(): string,
  toString(): string
}

export type Migration = {
  up(SchemaTool: SchemaToolContext): any,
  down(SchemaTool: SchemaToolContext): any
}

export type MigrationManager = {
  addInitializer(name: string, handler: Migration): void,
  addMigration(name: string, handler: Migration): void,
  apply(): Promise<boolean>,
  revertAll(): Promise<boolean>
}
