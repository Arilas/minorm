import { withRetry } from './withRetry'
import { Adapter } from '../types'

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

export interface ColumnMeta {
  tableName: string
  columnName: string
  dataType?: string
  dataLength?: number
  isNullable?: number
}

export interface TableMetadata {
  [key: string]: ColumnMeta
}

export interface Relation {
  tableName: string
  columnName: string
  referencedTableName: string
  referencedColumnName: string
}

export interface MetadataManager {
  hasTable(tableName: string): boolean
  getTable(
    tableName: string,
  ): {
    columns: { [key: string]: ColumnMeta }
    relations: { [key: string]: Relation }
  }
  hasAssociation(tableName: string, columnName: string): boolean
  getColumns(tableName: string): { [key: string]: ColumnMeta } | false
  ready(): Promise<void>
  isLoaded(): boolean
  clear(): void
}

export function createMetadataManager<A extends Adapter>(
  adapter: A,
): MetadataManager {
  let loaded = false
  let loadPromise: Promise<void> | null
  let dbSchema: {
    [key: string]: {
      columns: { [key: string]: ColumnMeta }
      relations: { [key: string]: Relation }
    }
  } = {}

  /**
  This function loads informaton about all tables in database and columns in this tables.
   */
  function loadTablesMetadata() {
    // console.log(adapter)
    /**
    We use withRetry there because when Pool is still in init mode requests like this can be rejected by timeout
     */
    return withRetry(
      () => adapter.getColumns(),
      // manager.getAdapter().query<RowDataPacket[]>({
      //   sql: TABLE_COLUMNS_META_QUERY,
      //   values: [manager.getConfiguration().database],
      // }),
    ).then(result => {
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
  }

  /**
  This function loads information about relations between tables in database and on information about referenced table for that relation
   */
  function loadRelationsMetadata() {
    /**
     * We use withRetry there because when Pool is still in init mode requests like this can be rejected by timeout
     */
    return withRetry(
      () => adapter.getRelations(),
      // manager.getAdapter().query<RowDataPacket[]>({
      //   sql: TABLE_RELATION_META_QUERY,
      //   values: [manager.getConfiguration().database],
      // }),
    ).then(result => {
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
  }

  /**
  This function returns a boolean flag about loading state of MetadataManager
   */
  function isLoaded() {
    return loaded
  }

  /**
  This function is used to init MetadataManager by loading all infromation about database
   */
  function ready() {
    if (loadPromise) {
      return loadPromise
    }
    loadPromise = Promise.all([
      loadTablesMetadata(),
      loadRelationsMetadata(),
    ]).then(() => {
      loadPromise = null
      loaded = true
    })
    return loadPromise
  }

  /**
  This function is used to check that some table is exist and MetadataManager has information about it
   */
  function hasTable(tableName: string) {
    return dbSchema.hasOwnProperty(tableName)
  }

  /**
  This function returns all information that we have for a specific table in format:
  ```json
  {
    "columns": {
      "id": {
        "tableName": "posts",
        "columnName": "id",
        "dataType": "int",
        "dataLength": 255,
        "isNullable": 1
      },
      //... other fields
    },
    "relations": {
      "creator_id": {
        "tableName": "posts",
        "columnName": "creator_id",
        "referencedTableName": "users",
        "referencedColumnName": "id"
      }
    }
  }
  ```
   */
  function getTable(tableName: string) {
    return dbSchema[tableName]
  }

  /**
  This function checks that we have a relation registered for a column in some table
   */
  function hasAssociation(tableName: string, columnName: string) {
    return (
      hasTable(tableName) &&
      dbSchema[tableName].relations.hasOwnProperty(columnName)
    )
  }

  /**
  This function returns columns description for some table in format:
  ```json
  {
    "id": {
      "tableName": "users",
      "columnName": "id",
      "dataType": "int",
      "dataLength": 255,
      "isNullable": 1
    },
    //... other fields
  }
  ```
  Or false when table definition is not found
   */
  function getColumns(tableName: string) {
    return hasTable(tableName) && dbSchema[tableName].columns
  }

  /**
  This function is used to clear the state of Metadata Manager from loaded schema and table description.
   */
  function clear() {
    dbSchema = {}
    loaded = false
    loadPromise = null
  }

  return {
    isLoaded,
    ready,
    hasTable,
    getTable,
    hasAssociation,
    getColumns,
    clear,
  }
}
