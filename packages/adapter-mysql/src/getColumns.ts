import { ColumnMeta } from '@minorm/core'
import { Pool } from 'mysql2/promise'

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

export async function getColumns(
  pool: Pool,
  database: string | undefined,
): Promise<ColumnMeta[]> {
  const [result] = await pool.execute(TABLE_COLUMNS_META_QUERY, [database])
  // @ts-ignore
  return result
}
