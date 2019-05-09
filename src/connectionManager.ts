import {
  PoolOptions,
  QueryOptions,
  RowDataPacket,
  OkPacket,
  FieldPacket,
} from 'mysql2'
import MySQL, { Pool as MySQLPool, Connection } from 'mysql2/promise'

export type SimpleValue = string | number | boolean | null | undefined

export interface Pool {
  getConnection(): Promise<Connection>
  end(): Promise<void>
  query<T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[]>(
    sql: string,
  ): Promise<[T, FieldPacket[]]>
  query<T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[]>(
    sql: string,
    values: SimpleValue | SimpleValue[] | { [param: string]: SimpleValue },
  ): Promise<[T, FieldPacket[]]>
  query<T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[]>(
    options: QueryOptions,
  ): Promise<[T, FieldPacket[]]>
  query<T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[]>(
    options: QueryOptions,
    values: SimpleValue | SimpleValue[] | { [param: string]: SimpleValue },
  ): Promise<[T, FieldPacket[]]>

  execute<
    T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[]
  >(
    sql: string,
  ): Promise<[T, FieldPacket[]]>
  execute<
    T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[]
  >(
    sql: string,
    values: SimpleValue | SimpleValue[] | { [param: string]: SimpleValue },
  ): Promise<[T, FieldPacket[]]>
  execute<
    T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[]
  >(
    options: QueryOptions,
  ): Promise<[T, FieldPacket[]]>
  execute<
    T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[]
  >(
    options: QueryOptions,
    values: SimpleValue | SimpleValue[] | { [param: string]: SimpleValue },
  ): Promise<[T, FieldPacket[]]>
}

export type QueryResult<
  T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[]
> = Promise<[T, FieldPacket[]]>

export {
  RowDataPacket,
  OkPacket,
  FieldPacket,
  Connection,
  QueryOptions,
  PoolOptions,
}

export function mySQLCreatePool(connectionConfig: PoolOptions): MySQLPool {
  return MySQL.createPool(connectionConfig)
}

let connectionProvider = mySQLCreatePool

export function connect(connectionConfig: PoolOptions): Pool {
  return connectionProvider(connectionConfig)
}

export function setProvider(provider: typeof mySQLCreatePool) {
  connectionProvider = provider
}

export function resetProvider() {
  connectionProvider = mySQLCreatePool
}
