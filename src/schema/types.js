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
  dropTable(tableName: string): SchemaToolGateway
}

export type SchemaToolGatewayApi = {
  addLine(line: {toString(): string} | string): string | Object,
  addAlter(line: {toString(): string} | string): string | Object,
  removeAlter(line: string ): string 
}

export type SchemaToolGateway = {
  getQuery(): string | null,
  getAlters(): Array<string>,
  getApi(): ?SchemaToolGatewayApi
}

export type SchemaToolCreateTableContext = {
  column(columnName: string): SchemaToolColumnContext,
  id(): SchemaToolColumnContext,
  createdAndModified(): SchemaToolColumnContext,
  dropColumn(columnName: string): string,
  dropIndex(indexName: string): string,
  dropRef(foreignKey: string): string,
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
