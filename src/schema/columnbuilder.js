/** @flow */

export const TYPE_VARCHAR = 'VARCHAR'
export const TYPE_TEXT = 'TEXT'
export const TYPE_INT = 'INT'
export const TYPE_LONGTEXT = 'LONGTEXT'
export const TYPE_DATE = 'DATE'
export const TYPE_DATETIME = 'DATETIME'
export const TYPE_TIME = 'TIME'
export const TYPE_TINYINT = 'TINYINT'

export function createColumnBuilder(columnName: string) {
  let type = 'VARCHAR'
  let nullable = true
  let primary = false
  let unsigned = false
  let autoIncrement = false
  let defaultValue
  let length = 255
  return {
    string(len: number = 255) {
      type = TYPE_VARCHAR
      length = len
      return this
    },
    text() {
      type = TYPE_TEXT
      length = null
      return this
    },
    longText() {
      type = TYPE_LONGTEXT
      length = null
      return this
    },
    bool() {
      type = TYPE_TINYINT
      length = 1
      return this
    },
    int(len: number = 11) {
      type = TYPE_INT
      length = len
      return this
    },
    date() {
      type = TYPE_DATE
      length = null
      return this
    },
    dateTime() {
      type = TYPE_DATETIME
      length = null
      return this
    },
    time() {
      type = TYPE_TIME
      length = null
      return this
    },
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
    },
    buildColumnPart() {
      const typePart = length ? `${type}(${length})` : type
      const unsignedPart = unsigned ? ' UNSIGNED' : ''
      const defaultValuePart = defaultValue !== undefined ? ` DEFAULT '${defaultValue}'` : ''
      const incrementPart = autoIncrement ? ' AUTO_INCREMENT' : ''
      const nullablePart = !nullable ? ' NOT NULL' : ''
      const primaryPart = primary ? ' PRIMARY KEY' : ''
      return `\`${columnName}\` ${typePart}${unsignedPart}${defaultValuePart}${incrementPart}${nullablePart}${primaryPart}`
    },
    toString() {
      return this.buildColumnPart()
    }
  }
}