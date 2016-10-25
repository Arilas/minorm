/** @flow */
import type {Relation} from '../types'

export default function createMetadataManager() {
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
    let associations: {[key: string]: {[key: string]: Relation}} = {}

    const logger = manager.gerLogger()

    return {
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
        associations = {}
      }
    }
  }
}