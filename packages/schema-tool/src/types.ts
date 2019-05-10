import { Criteria, BaseRecord } from '@minorm/core'
import { SimpleValue } from '@minorm/core/lib/types'

export interface SchemaTool {
  setSchemaInit(handler: Migration): void
  initSchema(): Promise<boolean>
  dropSchema(): Promise<boolean>
  getMigrationManager(): MigrationManager
}

export interface SchemaToolContext {
  table(
    tableName: string,
    callback: (ctx: SchemaToolCreateTableContext) => void,
  ): SchemaToolGateway
  use(
    tableName: string,
    callback: (ctx: SchemaToolCreateTableContext) => void,
  ): SchemaToolGateway
  dropTable(tableName: string): SchemaToolGateway
  put(tableName: string, entities: BaseRecord[]): SchemaToolGateway
  addSql(sql: string): SchemaToolGateway
  findAndUpdate(
    tableName: string,
    criteria: Criteria,
    changes: BaseRecord,
  ): SchemaToolGateway
  asyncExecute(): SchemaToolGateway
  asyncQuery(sql: string): SchemaToolGateway
}

export interface SchemaToolGatewayApi {
  lineAdd(line: { toString(): string } | string): void
  lineDrop(line: { toString(): string } | string): void
  alterAdd(line: { toString(): string } | string): void
  alterDrop(line: { toString(): string } | string): void
}

export interface SchemaToolGateway {
  getApi(): SchemaToolGatewayApi | null
  getAction(): {
    type: string
  } | null
  getPreQueries(): string[]
  getAddQueries(): string[]
  getDropQueries(): string[]
  getAddAlterQueries(): string[]
  getDropAlterQueries(): string[]
  getPostQueries(): string[]
}

export interface SchemaToolCreateTableContext {
  column(columnName: string): SchemaToolColumnContext
  id(): SchemaToolColumnContext
  refColumn(
    columnName: string,
    targetTableName: string,
    targetColumnName?: string,
  ): SchemaToolColumnContext
  createdAndModified(): SchemaToolColumnContext
  dropColumn(columnName: string): void
  dropIndex(indexName: string): void
  dropRef(indexName: string): void
  dropColumnRef(columnName: string): void
  dropColumnUnique(columnName: string): void
  dropColumnIndex(columnName: string): void
  dropColumnKey(columnName: string): void
  ref(
    columnName: string,
    referencedTableName: string,
    referencedColumnName: string,
  ): void
  unique(columnName: string, indexName?: string): void
  index(columnName: string, indexName?: string): void
  key(columnName: string, indexName?: string): void
}

export interface SchemaToolColumnContext {
  string(len?: number): SchemaToolColumnContext
  text(): SchemaToolColumnContext
  longText(): SchemaToolColumnContext
  bool(): SchemaToolColumnContext
  tinyInt(len?: number): SchemaToolColumnContext
  int(len?: number): SchemaToolColumnContext
  date(): SchemaToolColumnContext
  dateTime(): SchemaToolColumnContext
  time(): SchemaToolColumnContext
  notNull(): SchemaToolColumnContext
  primary(): SchemaToolColumnContext
  unsigned(): SchemaToolColumnContext
  autoIncrement(): SchemaToolColumnContext
  defaultValue(value: SimpleValue): SchemaToolColumnContext
  build(): string
  toString(): string
}

export interface Migration {
  up(SchemaTool: SchemaToolContext): void | Generator
  down(SchemaTool: SchemaToolContext): void | Generator
}

export interface MigrationManager {
  addInitializer(name: string, handler: Migration): void
  addMigration(name: string, handler: Migration): void
  execute(
    migrations: Map<string, Migration>,
    method: 'up' | 'down',
  ): Promise<boolean>
  getMigrationsToExecute(): Promise<Map<string, Migration>>
  apply(): Promise<boolean>
  revertAll(): Promise<boolean>
}
