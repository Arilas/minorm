/** @flow */

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
  put(tableName: string, entities: Array<{[key: string]: any}>): void,
  addSql(sql: string): void
}

export type SchemaToolGatewayApi = {
  lineAdd(line: {toString(): string} | string): void,
  lineDrop(line: {toString(): string} | string): void,
  alterAdd(line: {toString(): string} | string): void,
  alterDrop(line: {toString(): string} | string): void
}

export type SchemaToolGateway = {
  getAddQuery(): Array<string>,
  getDropQuery(): Array<string>,
  getAddAlters(): Array<string>,
  getDropAlters(): Array<string>,
  getApi(): ?SchemaToolGatewayApi
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
  up(SchemaTool: SchemaToolContext): void,
  down(SchemaTool: SchemaToolContext): void
}

export type MigrationManager = {
  addInitializer(name: string, handler: Migration): void,
  addMigration(name: string, handler: Migration): void,
  apply(): Promise<boolean>,
  revertAll(): Promise<boolean>
}
