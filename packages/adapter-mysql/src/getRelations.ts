import { Relation, Adapter } from '@minorm/core'

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

export async function getRelations(
  pool: Adapter,
  database: string | undefined,
): Promise<Relation[]> {
  const [result] = await pool.execute(TABLE_RELATION_META_QUERY, [database])
  // @ts-ignore
  return result
}
