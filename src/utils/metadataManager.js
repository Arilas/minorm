/** @flow */
import type {Relation, Manager, MetadataManager} from '../types'

const TABLE_COLUMNS_META_QUERY = `
  SELECT 
    TABLE_NAME tableName,
    COLUMN_NAME columnName,
    DATA_TYPE dataType,
    CHARACTER_MAXIMUX_LENGTH dataLength,
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
  GROUP BY TABLE_NAME , COLUMN_NAME
`

export default function createMetadataManager(): (manager: Manager) => MetadataManager {
  return manager => {
    /**
     * {
     *   tableName1: {
     *     columnName1: {
     *       tableName: string, //Table to join with
     *       columnName: string, //Inner column name in tableName1
     *       referencedColumnName: string //Column in joined tabls
     *     }
     *   }
     * }
     */
    let loaded = false
    let loadPromise
    let dbSchema = {}
    let associations: {[key: string]: {[key: string]: Relation}} = {}

    const logger = manager.getLogger()

    return {
      loadTablesMetadata() {
        return manager.getConnection().query(
          TABLE_COLUMNS_META_QUERY,
          [manager.getConfiguration().database]
        ).then(([result]) => {
          dbSchema = result.reduce((target, row) => ({
            ...target,
            [row.tableName]: {
              columns: {
                ...(target.hasOwnProperty(row.tableName) ? target[row.tableName].columns : {}),
                [row.columnName]: row
              },
              relations: dbSchema.hasOwnProperty(row.tableName) ? dbSchema[row.tableName].relations : {}
            }
          }), dbSchema)
        })
      },
      loadRelationsMetadata() {
        return manager.getConnection().query(
          TABLE_RELATION_META_QUERY,
          [manager.getConfiguration().database]
        ).then(([result]) => {
          dbSchema = result.reduce((target, row) => ({
            ...target,
            [row.tableName]: {
              columns: dbSchema.hasOwnProperty(row.tableName) ? dbSchema[row.tableName].columns : {},
              relations: {
                ...(target.hasOwnProperty(row.tableName) ? target[row.tableName].relations : {}),
                [row.columnName]: row
              }
            }
          }), dbSchema)
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
          this.loadRelationsMetadata()
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
        return associations.hasOwnProperty(tableName)
      },
      getTable(tableName) {
        return associations[tableName]
      },
      hasAssociation(tableName, columnName) {
        return this.hasTable(tableName) && associations[tableName].hasOwnProperty(columnName)
      },
      setAssociations(tableName, relations) {
        logger && logger.debug(`Loaded relations for ${tableName} with associations: ${relations.map(r => r.columnName).join(', ')}`) 
        if (associations.hasOwnProperty(tableName)) {
          logger && logger.warn(`Twice Loaded meta for table ${tableName}. Please check that you use manager.getRepository() method`)
          return
        }
        // TODO: Fix loading metadata in metadataManager
        associations[tableName] = relations.reduce((target, relation) => manager.getRepository(relation.tableName) && ({
          ...target,
          [relation.columnName]: relation
        }), {})
      },
      clear() {
        dbSchema = {}
        loaded = false
        loadPromise = null
        associations = {}
      }
    }
  }
}