# MinORM
[![Build Status](https://travis-ci.org/Arilas/minorm.svg?branch=master)](https://travis-ci.org/Arilas/minorm)
[![codecov](https://codecov.io/gh/Arilas/minorm/branch/master/graph/badge.svg)](https://codecov.io/gh/Arilas/minorm)


MinORM is a high-performance ORM built on top of [Node MySQL2](https://github.com/sidorares/node-mysql2)
that is a continuation of Node MySQL-Native. Also MinORM uses [Squel](https://github.com/hiddentao/squel) library as Query Builder

It's really lightweight, provide simple solutions that just works without a lot of configurations.

## Why use MinORM

If you are tired by highweight ORMs like [Bookshelf](https://github.com/tgriesser/bookshelf) or [Sequelize](https://github.com/sequelize/sequelize), and want just some basic functionality
from it - MinORM can be a good start point.

## Installation and usage

```npm install --save minorm```

```js
import {createManager} from 'minorm'

export const manager = createManager({
  //options like for MySQL2 pool creation
})
manager.connect()

export const PostsRepo = {
  ...manager.getRepository('posts'),
  async getPostsFromUser(id) {
    const postQuery = this.startQuery('post')
      .include('post', 'creator_id')
      .tryInclude('creator', 'avatar_id')
      .where('post.creator_id = ?', id)
      .criteria({
        'post.title': {
          $not: 'Bad title'
        }
      })
    const [result] = await manager.nestQuery(postQuery)
    //Or:
    const result = await postQuery.execute(true)
    return result.map(({post, creator}) => ({
      ...post,
      creator
    }))
  }
}
```

## Manager

* `connect()` - connect to database
* `getRepository(tableName)` - returns a Repository
* `getConnection()` - returns MySQL Connection from pool
* `getLogger()` returns logger used for manager
* `getPool()` - returns Connection pool
* `clear()` - clear connection, Repositories and Metadata
* `getMetadataManager()` - returns Metadata manager
* `setMetadataManager(manager)` - replace Metadata manager with cachable
* `query(query: SqeulQuery)` - execute query in pool
* `nestQuery(query: SquelQuery)` - execute query and return result as ```[{table1: {feilds}, table2: {}}, {table1: {fiedls}}]``` etc 
* `startQuery()` - returns a wrapped Squel Query Builder
* `extendRepository(tableName, callback)` - If you want to extend Repository by some methods you can follow two ways:
  1. Just mix methods as showed in example
  2. Use `extendRepository` method, that receive original repo object and must return new repo object. Can be used to override native methods like `hydrate` etc.

## Repository

MinORM uses Repositories for working with tables. One table == one Repository. It has a lot of useful methods like:

* `find(id)` - search single record in DB by id and wrap it as the model
* `findOneBy(criteria)` - search single record in DB by criteria.
* `findBy(criteria, orderBy = {}, limit, offset)` - search records by criteria with limits and offsets
* `startQuery(alias = null)` - create select Query
* `create(data)` - adds Model methods to any object with structure
* `hydrate(data, isFetched)` - helper method that attach Model methods to any object and accept argument that promise that this object is fetched from DB without changes.
* `getMetadata()` - returns object with all table columns

Criteria is a plain object with `key` is a column name, `value` is a simple string, number, etc or object with operator like `$in`, `$not`, `$like` and `$notIn`.

## Model

MinORM don't have any column mappers and/or hydrators. So Models is just result from `mysql2` qeury, with assigned non-enumerable methods:

* `save()` - UPDATE or INSERT data to DB
* `populate(data)` - populate data to model

## Debug

`createManager` supports second parameter as logger, you can choose logger to use it can be simple `console`, `winston` or any other logger.
