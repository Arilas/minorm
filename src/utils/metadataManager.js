/** @flow */
import type { Manager, MetadataManager } from '../types'

const TABLE_COLUMNS_META_QUERY = `
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
const TABLE_RELATION_META_QUERY = `
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

export default function createMetadataManager(): (
  manager: Manager,
) => MetadataManager {
  return manager => {
    let loaded = false
    let loadPromise
    let dbSchema = {}

    const logger = manager.getLogger()

    return {
      loadTablesMetadata() {
        return manager
          .getPool()
          .query(TABLE_COLUMNS_META_QUERY, [
            manager.getConfiguration().database,
          ])
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
          .query(TABLE_RELATION_META_QUERY, [
            manager.getConfiguration().database,
          ])
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
        if (logger) {
          logger.info('Loaded Database Schema')
        }
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
}
