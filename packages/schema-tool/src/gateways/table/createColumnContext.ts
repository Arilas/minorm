import { SchemaToolColumnContext } from '../../types'
import { MetadataManager } from '@minorm/core'
import { SimpleValue } from '@minorm/core/src/types'

export const TYPE_VARCHAR = 'VARCHAR'
export const TYPE_TEXT = 'TEXT'
export const TYPE_INT = 'INT'
export const TYPE_LONGTEXT = 'LONGTEXT'
export const TYPE_DATE = 'DATE'
export const TYPE_DATETIME = 'DATETIME'
export const TYPE_TIME = 'TIME'
export const TYPE_TINYINT = 'TINYINT'

export function createColumnContext(
  columnName: string,
  metadataManager: MetadataManager,
  tableName: string,
): SchemaToolColumnContext {
  let type = TYPE_VARCHAR
  let nullable = true
  let primary = false
  let unsigned = false
  let autoIncrement = false
  let defaultValue: SimpleValue
  let length: number | null = 255

  function makeSimpleTypeChanger(newType: string) {
    return function() {
      type = newType
      length = null
      // @ts-ignore
      return this
    }
  }

  function makeParametrizedTypeChanger(newType: string, defaultLength = 255) {
    return function(len = defaultLength) {
      type = newType
      length = len
      // @ts-ignore
      return this
    }
  }

  return {
    notNull() {
      nullable = false
      return this
    },
    primary() {
      primary = true
      return this
    },
    unsigned() {
      unsigned = true
      return this
    },
    autoIncrement() {
      autoIncrement = true
      return this
    },
    defaultValue(value: SimpleValue) {
      defaultValue = value
      return this
    },
    build() {
      const typePart = length ? `${type}(${length})` : type
      const unsignedPart = unsigned ? ' UNSIGNED' : ''
      const defaultValuePart =
        defaultValue !== undefined
          ? ` DEFAULT '${defaultValue == null ? 'NULL' : defaultValue}'`
          : ''
      const incrementPart = autoIncrement ? ' AUTO_INCREMENT' : ''
      const nullablePart = !nullable ? ' NOT NULL' : ''
      const primaryPart = primary ? ' PRIMARY KEY' : ''
      return `${
        metadataManager.hasTable(tableName) ? 'COLUMN ' : ''
      }\`${columnName}\` ${typePart}${unsignedPart}${defaultValuePart}${incrementPart}${nullablePart}${primaryPart}`
    },
    toString() {
      return this.build()
    },
    // Types
    text: makeSimpleTypeChanger(TYPE_TEXT),
    longText: makeSimpleTypeChanger(TYPE_LONGTEXT),
    date: makeSimpleTypeChanger(TYPE_DATE),
    dateTime: makeSimpleTypeChanger(TYPE_DATETIME),
    time: makeSimpleTypeChanger(TYPE_TIME),
    string: makeParametrizedTypeChanger(TYPE_VARCHAR),
    int: makeParametrizedTypeChanger(TYPE_INT, 11),
    tinyInt: makeParametrizedTypeChanger(TYPE_TINYINT),
    bool: makeParametrizedTypeChanger(TYPE_TINYINT, 1),
  }
}
