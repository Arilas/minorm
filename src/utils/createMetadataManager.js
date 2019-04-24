/** @flow strict */
import type { Queries } from '../manager'

export const TABLE_COLUMNS_META_QUERY = `
  SELECT
    TABLE_NAME tableName,
    COLUMN_NAME columnName,
    DATA_TYPE dataType,
    CHARACTER_MAXIMUM_LENGTH dataLength,
    IS_NULLABLE isNullable
  FROM
    INFORMATION_SCHEMA.COLUMNS
  WHERE
    TABLE_SCHEMA = ?
`
export const TABLE_RELATION_META_QUERY = `
  SELECT
    TABLE_NAME tableName,
    COLUMN_NAME columnName,
    REFERENCED_TABLE_NAME referencedTableName,
    REFERENCED_COLUMN_NAME referencedColumnName
  FROM
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
  WHERE
    TABLE_SCHEMA = ?
        AND REFERENCED_TABLE_NAME IS NOT NULL
  GROUP BY TABLE_NAME , COLUMN_NAME , REFERENCED_TABLE_NAME , REFERENCED_COLUMN_NAME
`

export type ColumnMeta = {
  tableName: string,
  columnName: string,
  dataType: string,
  dataLength: number,
  isNullable: number,
}

export type TableMetadata = {
  [key: string]: ColumnMeta,
}

export type Relation = {
  tableName: string,
  columnName: string,
  referencedTableName: string,
  referencedColumnName: string,
}

export type MetadataManager = {
  hasTable(tableName: string): boolean,
  getTable(tableName: string): { [key: string]: Relation },
  hasAssociation(tableName: string, columnName: string): boolean,
  getColumns(tableName: string): { [key: string]: ColumnMeta },
  ready(): Promise<void>,
  isLoaded(): boolean,
  clear(): void,
}

export function createMetadataManager(manager: Queries): MetadataManager {
  let loaded = false
  let loadPromise
  let dbSchema = {}

  return {
    loadTablesMetadata() {
      return manager
        .getPool()
        .query({
          sql: TABLE_COLUMNS_META_QUERY,
          values: [manager.getConfiguration().database],
        })
        .then(([result]) => {
          dbSchema = result.reduce(
            (target, row) => ({
              ...target,
              [row.tableName]: {
                columns: {
                  ...(target.hasOwnProperty(row.tableName)
                    ? target[row.tableName].columns
                    : {}),
                  [row.columnName]: row,
                },
                relations: dbSchema.hasOwnProperty(row.tableName)
                  ? dbSchema[row.tableName].relations
                  : {},
              },
            }),
            dbSchema,
          )
        })
    },
    loadRelationsMetadata() {
      return manager
        .getPool()
        .query({
          sql: TABLE_RELATION_META_QUERY,
          values: [manager.getConfiguration().database],
        })
        .then(([result]) => {
          dbSchema = result.reduce(
            (target, row) => ({
              ...target,
              [row.tableName]: {
                columns: dbSchema.hasOwnProperty(row.tableName)
                  ? dbSchema[row.tableName].columns
                  : {},
                relations: {
                  ...(target.hasOwnProperty(row.tableName)
                    ? target[row.tableName].relations
                    : {}),
                  [row.columnName]: row,
                },
              },
            }),
            dbSchema,
          )
        })
    },
    async initDbSchema() {
      if (loaded) {
        return true
      }
      if (loadPromise) {
        return loadPromise
      }
      loadPromise = Promise.all([
        this.loadTablesMetadata(),
        this.loadRelationsMetadata(),
      ])
      await loadPromise
      loadPromise = null
      loaded = true
    },
    isLoaded() {
      return loaded
    },
    async ready() {
      return await this.initDbSchema()
    },
    hasTable(tableName) {
      return dbSchema.hasOwnProperty(tableName)
    },
    getTable(tableName) {
      return dbSchema[tableName]
    },
    hasAssociation(tableName, columnName) {
      return (
        this.hasTable(tableName) &&
        dbSchema[tableName].relations.hasOwnProperty(columnName)
      )
    },
    getColumns(tableName) {
      return this.hasTable(tableName) && dbSchema[tableName].columns
    },
    clear() {
      dbSchema = {}
      loaded = false
      loadPromise = null
    },
  }
}
