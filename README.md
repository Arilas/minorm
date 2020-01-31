# Minorm

[![CircleCI](https://circleci.com/gh/Arilas/minorm.svg?style=svg)](https://circleci.com/gh/Arilas/minorm)[![codecov](https://codecov.io/gh/Arilas/minorm/branch/master/graph/badge.svg)](https://codecov.io/gh/Arilas/minorm)

Minorm is a high-performance ORM built on top of [Node MySQL2](https://github.com/sidorares/node-mysql2) connection Pool
which is a continuation of Node MySQL-Native. Also Minorm uses [Squel](https://github.com/hiddentao/squel) library as Query Builder

It's really lightweight, provide simple solutions that just works without a lot of configurations.

## Why use Minorm

Main features:

1. High performance
2. Native SQL queries
3. Automated left and inner joins by column name
4. Insert and Update models without declaring Model structure (ORM works with database Metadata and know all tables and fields)
5. Migrations manager and Schema Tool
6. Built-in Query Builder based on extended [Squel](https://github.com/hiddentao/squel)

If you are tired by highweight ORMs like [Bookshelf](https://github.com/tgriesser/bookshelf) or [Sequelize](https://github.com/sequelize/sequelize), and want just some basic functionality
from it - Minorm can be a good start point. Minorm also have build-in Migrations module that you can use.

## Installation and usage

`yarn add minorm`

```js
import { createManager } from '@minorm/core'
import { createAdapter } from '@minorm/adapter-mysql'

export const manager = createManager(
  createAdapter({
    //options like for MySQL2 pool creation
  }),
)

export const PostsRepo = {
  ...manager.getRepository('posts'),
  async getPostsFromUser(id) {
    const postQuery = this.startQuery('post')
      .field('creator.*')
      .field('avatar.*')
      .include('post', 'creator_id')
      .tryInclude('creator', 'avatar_id')
      .where('post.creator_id = ?', id)
      .criteria({
        'post.title': {
          $not: 'Bad title',
        },
      })
    const result = await postQuery.getMapper().fetch() // Automatically map relations
    return result
    //Or:
    const result = await postQuery.execute(true)
    return result.map(({ post, creator, avatar }) => ({
      ...post,
      creator: {
        ...creator,
        avatar,
      },
    }))
  },
}
```

Both options result with following result:

```json
[
  {
    "id": 1, // Post id
    "title": "Some",
    // ...Other fields from post
    "creator_id": 1,
    "creator": {
      "id": 1,
      // ...Other fields from post creator
      "avatar_id": 1,
      "avatar": {
        "id": 1
        // ...Other fields for user avatar
      }
    }
  }
  // ...Other posts
]
```

## Manager

- `ready(): Promise<void>` - execute all work related to connection and preparing metadata
- `getRepository(tableName): Repository` - returns a Repository
- `getAdapter(): Pool` - returns Connection pool
- `clear(): Promise<void>` - clear connection, Repositories and Metadata
- `getMetadataManager(): MetadataManager` - returns Metadata manager
- `setMetadataManager(manager)` - replace Metadata manager with cachable
- `query(query: SqeulQuery): Promise<[result, fields]>` - execute query in pool
- `execute(query: SqeulQuery): Promise<[result, fields]>` - execute query in pool
- `startQuery()` - returns a wrapped Squel Query Builder

## Repository

Minorm uses Repositories for working with tables. One table == one Repository. It has a lot of useful methods like:

- `find(id: number | string): Promise<Model | null>` - search single record in DB by id and wrap it as the model
- `findOneBy(criteria: Object): Promise<Model | null>` - search single record in DB by criteria.
- `findBy(criteria: Object, orderBy?: Object, limit?: number, offset?: number): Promise<Array<Model>>` - search records by criteria with limits and offsets
- `startQuery(alias?: string): SelectQueryBuilder` - create select Query
- `create(data?: Object): Model` - adds Model methods to any object with structure
- `hydrate(data: Object, isFetched?: boolean = false): Model` - helper method that attach Model methods to any object and accept argument that promise that this object is fetched from DB without changes.
- `getMetadata()` - returns table columns definitions
- `insert(data: Object): Promise<insertedId>` - update single or many rows in table
- `update(selector: number | Criteria, changes: Object): Promise<affectedRows>` - update single or many rows in table
- `remove(selector: number | Criteria): Promise<affectedRows>` - remove single or many rows in table

Criteria is a plain object with `key` is a column name, `value` is a simple string, number, etc or object with operator like `$in`, `$not`, `$like` and `$notIn`.

## Model

Minorm don't have any column mappers and/or hydrators. So Models is just result from `mysql2` qeury, with assigned non-enumerable methods:

- `getChanges(): Object` - returns changes between original data and current state
- `save(): Promise<self>` - UPDATE or INSERT data to DB
- `isDirty(): boolean` - checks that model is saved or not
- `populate(data): void` - populate data to model
- `remove(): Promise<1>` - remove model in DB

## Debug

`createManager` supports second parameter as logger, you can choose logger to use it can be simple `winston` or any other logger.

## Schema Tool and Migrations

Minorm have ability to write your own Migrations and initializers. For example:

```js
import { createSchemaTool } from 'minorm'

const schemaTool = createSchemaTool(manager)
schemaTool.setSchemaInit({
  //It's also migration
  up(schema) {
    schema.table('users', table => {
      table.id()
      table.column('login').notNull()
      table.column('password').notNull()
      table.createdAndModified()
    })
    schema.table('posts', table => {
      table.id()
      table.column('title').notNull()
      table.column('body').text()
      table
        .column('creator_id')
        .int()
        .unsigned()
      table.createdAndModified()
      table.ref('creator_id', 'users', 'id')
    })
  },
  down(schema) {
    schema.dropTable('posts')
    schema.dropTable('users')
  },
})
schemaTool.getMigrationManager().addMigration('2016-11-16 19:01:18', {
  up(schema) {
    schema.use('posts', table => {
      table.index('title')
    })
  },
  down(schema) {
    schema.use('users', table => {
      table.dropIndex('IDX_title')
    })
  },
})
schemaTool.initSchema().then(() => {
  console.log('Database inited')
})
```

When you write Migrations you don't need to worry about async things. All references will be added after all tables are created. So
in case of cross-relations between tables you will not receive any problems.
