# Getting Started

Minorm is really easy to integrate with any of existing project

```bash
yarn add minorm
```

Make db configuration in your config like:

```js
export default {
  // Your other configs
  minorm: {
    connection: {
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || 'user',
      password: process.env.hasOwnProperty('MYSQL_PASS')
        ? process.env.MYSQL_PASS
        : 'password',
      database: process.env.MYSQL_DB || 'app_db',
    },
  },
}
```

Add file where you will initialize your manager, like `src/db/index.js` with this content:

```js
/** @flow */
import { createManager } from 'minorm'
import config from '../config'

export const manager = createManager(config.minorm.connection)
```

It's ready to use.

Minorm will automatically parse your database for tables, columns and relations so you don't need to manually map all models.

## Integrate to startup

Minorm connection is async, so if you need to know, when it's ready you can use `manager.ready()` method like:

```js
//server.js
import Koa from 'koa'
import { manager } from './db'
import config from './config'

const app = new Koa()
//Your code

async function startup() {
  await manager.ready()
  app.listen(config.api.port)
}
startup()
```

But for the most cases it's not required

## Making a SELECT queries

For example you have table 'posts' and want to make some queries for it

```js
const repository = manager.getRepository('posts')
```

You can find entity by id:

```js
const post = await repository.find(5)
if (post == null) {
  // Post not found
}
```

You can find some post by more complex criteria:

```js
const post = await repository.findOneBy({
  title: 'Some title',
  status: {
    $not: 'removed',
  },
})
if (post == null) {
  // Post not found
}
```

You also can find many items for complex criteria:

```js
const posts = await repository.findBy({
  status: {
    $not: 'removed',
  },
})
```

You also can write custom query:

```js
const posts = await repository
  .startQuery('post')
  .where('post.title = ?', 'Some title')
  .limit(10)
  .offset(20)
  .execute()
```

## Making an INSERT to table

You can simple write any data to table with simple code:

```js
const post = await repository.create({
  title: 'Some title',
  status: 'active'
  columnThatNotExistsInTable: 'will be ignored' // Minorm automatically detect table
  // columns and will ignore fields that is not exists in database
}).save()
console.log(post.id) // will show inserted id
```

## Making an UPDATE for models

Methods like `find()`, `findOneBy()` and `findBy()` inject helpers to each object in result like: `save()`, `remove()` and `populate()`

So you can use:

```js
let post = await repository.find(5)
if (post == null) {
  post = repository.create()
}
post.title = 'Test title'
post.populate({
  status: 'active',
  modifiedAt: new Date(),
})
await post.save() // Will insert or update existing row in table
```

## Removing data

You can simple remove row from model:

```js
const post = await repository.find(5)
if (post == null) {
  return
}
await post.remove()
```

Or by using repository method to remove without fetching:

```js
await repository.remove(5)
```

Or even using some criteria for remove:

```js
await repository.remove({
  status: 'removed',
})
```

## Attaching model helpers for received rows by custom query:

You can attach model helpers for any fetched row by:

```js
const [post] = await repository
  .startQuery('post')
  .where('post.title = ?', 'Some title')
  .limit(1)
  .execute()
if (post == null) {
  return
}
repository.hydrate(post, true) // Second argument is flag, that we fetched this row
post.status = 'active'
post.save()
```
