/** @flow strict */
// eslint-disable-next-line
import { Delete as $DeleteQuery, Select as $SelectQuery } from 'squel'

export type BaseRecord = {
  id?: ?string | number,
}

export type Model<T: BaseRecord> = {
  ...T,
  save(): Promise<self>,
  populate(data: $Shape<T>): void,
  remove(): Promise<number>,
}

export type Criteria = {
  [key: string]:
    | string
    | number
    | {
        [key: string]:
          | string
          | number
          | null
          | void
          | Array<string | number | null | void>,
      },
}

export type SelectQueryMapper = {
  setRelation(from: string, alias: string): void,
  setEntryPoint(alias: string): void,
  build(): BaseRecord,
  map(rawData: { [key: string]: ?BaseRecord }): BaseRecord | null,
}

export type Mapper<T: BaseRecord> = {
  fetch(): Promise<
    Array<{
      ...T,
      [key: string]: BaseRecord,
    }>,
  >,
}

declare export class SelectQuery<T: BaseRecord> extends $SelectQuery {
  include(fromAlias: string, columnName: string, alias?: string): this;
  tryInclude(fromAlias: string, columnName: string, alias?: string): this;
  criteria(criteria: Criteria): this;
  execute(): Promise<Array<T>>;
  execute(
    nestTables: true,
  ): Promise<Array<{ [key: string]: { [key: string]: BaseRecord } }>>;
  execute(nestTables: false): Promise<Array<T>>;
  getMapper(): Mapper<T>;
}

export type InsertQuery = {
  into(tableName: string): InsertQuery,
  set(key: string, value: string | number | null | void): InsertQuery,
  setFields(entity: {
    [key: string]: string | number | null | void,
  }): InsertQuery,
  setFieldsRows(
    entities: Array<{ [key: string]: string | number | null | void }>,
  ): InsertQuery,
  toParam(): { text: string, values: Array<string | number | null | void> },
  execute(
    nestTables?: boolean,
  ): Promise<{
    insertId?: string | number,
    affectedRows?: number,
    changedRows?: number,
  }>,
}

export type UpdateQuery = {
  table(tableName: string): UpdateQuery,
  where(condition: string, value?: string | number | null | void): UpdateQuery,
  criteria(criteria: Criteria): UpdateQuery,
  limit(limit: number): UpdateQuery,
  offset(offset: number): UpdateQuery,
  set(key: string, value: string | number | null | void): UpdateQuery,
  toParam(): { text: string, values: Array<string | number | null | void> },
  execute(
    nestTables?: boolean,
  ): Promise<{
    insertId?: string | number,
    affectedRows?: number,
    changedRows?: number,
  }>,
}

declare export class DeleteQuery extends $DeleteQuery {
  criteria(criteria: Criteria): this;
  execute(): Promise<{
    insertId?: string | number,
    affectedRows?: number,
    changedRows?: number,
  }>;
}
