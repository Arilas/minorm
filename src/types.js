/** @flow */
// eslint-disable
import type { Connection } from 'mysql2/promise'
// eslint-disable-next-line
import { Delete as $DeleteQuery, Select as $SelectQuery } from 'squel'

export type BaseRecord = {
  id?: ?number,
}

export type Model<T: BaseRecord = { [key: string]: any }> = {
  ...T,
  save(): Promise<self>,
  populate(data: { [key: string]: any }): void,
  remove(): Promise<number>,
}

export type Criteria = {
  [key: string]:
    | string
    | number
    | {
        [key: string]: any,
      },
}

export type SelectQueryMapper = {
  setRelation(from: string, alias: string): void,
  setEntryPoint(alias: string): void,
  build(): Object,
  map(rawData: { [key: string]: ?Object }): Object | null,
}

export type Mapper<T: BaseRecord = { [key: string]: any }> = {
  fetch(): Promise<
    Array<{
      ...T,
      [key: string]: any,
    }>,
  >,
}

declare export class SelectQuery<
  T: BaseRecord = { [key: string]: any },
> extends $SelectQuery {
  include(fromAlias: string, columnName: string, alias?: string): this;
  tryInclude(fromAlias: string, columnName: string, alias?: string): this;
  criteria(criteria: { [key: string]: any }): this;
  execute(): Promise<Array<T>>;
  execute(
    nestTables: true,
  ): Promise<Array<{ [key: string]: { [key: string]: any } }>>;
  execute(nestTables: false): Promise<Array<T>>;
  getMapper(): Mapper<T>;
}

export type InsertQuery = {
  into(tableName: string): InsertQuery,
  set(key: string, value: any): InsertQuery,
  setFields(entity: { [key: string]: any }): InsertQuery,
  setFieldsRows(entities: Array<{ [key: string]: any }>): InsertQuery,
  toParam(): { text: string, values: Array<any> },
  execute(nestTables?: boolean): Promise<any>,
}

export type UpdateQuery = {
  table(tableName: string): UpdateQuery,
  where(condition: string, value?: any): UpdateQuery,
  criteria(criteria: { [key: string]: any }): UpdateQuery,
  limit(limit: number): UpdateQuery,
  offset(offset: number): UpdateQuery,
  set(key: string, value: any): UpdateQuery,
  toParam(): { text: string, values: Array<any> },
  execute(nestTables?: boolean): Promise<any>,
}

declare export class DeleteQuery extends $DeleteQuery {
  criteria(criteria: { [key: string]: any }): this;
  execute(): Promise<any>;
}

export type Pool = {
  getConnection(): Promise<Connection>,
  query(sql: string | Object, values?: Array<any>): Promise<*>,
  execute(sql: string | Object, values?: Array<any>): Promise<*>,
  end(): Promise<void>,
}
