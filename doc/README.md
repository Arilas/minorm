# Installation

Minorm can be installed using `yarn` or `npm`.

```sh
yarn add minorm

npm install --save minorm
```

## Getting Started

To use minorm all you need is to make a configuration for a connection in format:

```js
export default {
  // Your other configs
  db: {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'user',
    password: process.env.hasOwnProperty('MYSQL_PASS')
      ? process.env.MYSQL_PASS
      : 'password',
    database: process.env.MYSQL_DB || 'app_db',
  },
}
```

If you want to read about other conenction configuration parameters please read [mysqljs/mysql doc](https://github.com/mysqljs/mysql#connection-options).

Please note that minorm by default use connection pool, so there's additional config [here](https://github.com/mysqljs/mysql#pool-options)

After you added your config all you need is to create a minorm manager:

```js
import { createManager } from 'minorm'
import config from '../config'

export const manager = createManager(config.db)
```

And also in some bootstrap function you will need to call:

```js
import { manager } from './models/manager'

//...
manager.connect()
await manager.ready()
```

We recommend to do it at place where you making your routers or setuping some other connection.

That's it! There's no need to manually map all your database tables or marking relations, because minorm loads it by default

## Usage

Minorm manager provide many functionality by default, but let's start from somethis easy.

For example you have database `users` that contains some data, so to work with it you can:

```js
const repo = manager.getRepository('users')
```

Now if you want to find something by `id` you will:

```js
const user = await repo.find(5)
if (user == null) {
  // Not found
}
```

If you want to find some data by simple condition you also can:

```js
const user = await repo.findOneBy({
  login: 'admin',
  group: {
    $in: [OWNER, ADMIN],
  },
  status: {
    $not: BLOCKED,
  },
})
```

There's also available helpers like `$notIn` and `$like` that you can use.

If you want to use the same logic to select an array of results you can use:

```js
const users = await repo.findBy({
  //...some cond
})
```

If you need to do some complex query you can use Query Builder:

```js
const user = await repo
  .startQuery()
  .where('id = ?', id)
  .where('group IN ?', [OWNER, ADMIN])
  .execute()
```

minorm uses [squel](https://github.com/hiddentao/squel) Qeury Builder so you can check their docs, but with some additional helpers.

### Models

If you fetch data using `find`, `findOneBy` or `findBy` you receive a wrapped instance of your data with additional functionality like `save()`, `populate()` and `remove()`

You can use them as:

```js
const user = await repo.find(5)
user.login = 'new-login'
user.nonExistingColumn = 'some data'
await user.save()
```

```js
const user = await repo.find(5)
user.populate({
  login: 'new-login',
  nonExistingColumn = 'some data',
})
await user.save()
```

```js
const user = await repo.find(5)
await user.remove()
```

minorm knows about your database structure so there's no need to manually map all fields. That's why you can add some helper data to models and everything will work like expected

### Query Builder

Minorm uses Squel as Query Builder but we added some helpers that can help you with your queries.

Let's start from `criteria()` helper. It's accesible in `select()`, `update()`, `remove()` and `insert()` queries.

It's used in examples with `repo.findOneBy` and `repo.findBy`, so you can do:

```js
const users = await repo
  .startQuery('user')
  .criteria({
    'user.status': {
      $not: BLOCKED,
    },
    'user.group': {
      $in: [OWNER, ADMIN],
    },
  })
  .execute()
```

The next helper is `include()` which helps you to automate JOIN's.

Let's imagine that you have table `posts` which have reference to `users` table by `creator_id` field. In SQL you will write:

```sql
SELECT post.*, creator.*
  FROM posts post
  INNER JOIN users creator ON (post.creator_id = creator.id)
```

But minorm knows about this relation and have ability to automate this by using:

```js
const repo = manager.getRepository('posts')
repo
  .startQuery('post')
  .field('creator.*')
  .include('post', 'creator_id')
```

Or the same without repo

```js
manager
  .startQuery()
  .select()
  .field('post.*')
  .field('creator.*')
  .from('posts', 'post')
  .include('post', 'creator_id')
```

So in your Query you have table alias `post` and you want to join with referenced table for a field `creator_id`. That's it.

By default with JOIN `include()` will create an alias by removing `_id` from a column name, but if you want, you can change it by providing third argument like `creator` in example above

Another example is `tryInclude()` which automate `LEFT JOIN`s.

Let's do more complex example. The same query as above, but you want to also fetch user avatar if it exists. So in SQL you will do:

```sql
SELECT post.*, creator.*, avatar.*
  FROM posts post
  INNER JOIN users creator ON (post.creator_id = creator.id)
  LEFT JOIN avatars avatar ON (creator.avatar_id = avatar.id)
```

Using minorm you can write:

```js
const repo = manager.getRepository('posts')
repo
  .startQuery('post')
  .field('creator.*')
  .field('avatar.*')
  .include('post', 'creator_id')
  .tryInclude('creator', 'avatar_id')
```

How to fetch all of this data with this complex examples?

For this purpose we have a mapper. So when you will execute:

```js
const repo = manager.getRepository('posts')
const posts = await repo
  .startQuery('post')
  .field('creator.*')
  .field('avatar.*')
  .include('post', 'creator_id')
  .tryInclude('creator', 'avatar_id')
  .getMapper()
  .fetch()
```

posts will be an array of:

```js
posts = [
  {
    //Content from a posts table
    id: 5,
    title: 'some',
    creator_id: 2,
    creator: {
      //Content from a users table
      id: 2,
      login: 'some',
      avatar_id: 100,
      avatar: {
        //Content from a avatars table
        id: 100,
        path: 'dsd',
      },
    },
  },
  {
    //..Other post
  },
]
```

So minorm automatically made a structure that shows the real relations between data

Another helper that are available in Query Builder is `execute()` which can be used to receive result from a request:

```js
const users = await repo
  .startQuery('user')
  .criteria({
    'user.status': {
      $not: BLOCKED,
    },
    'user.group': {
      $in: [OWNER, ADMIN],
    },
  })
  .execute()
```

But this helper can accept additional parameter to receive other fields that we JOIN'ed or calculated. For this we will use:

```js
const repo = manager.getRepository('posts')
const posts = await repo
  .startQuery('post')
  .field('creator.*')
  .field('avatar.*')
  .include('post', 'creator_id')
  .tryInclude('creator', 'avatar_id')
  .execute(true)
```

In this example posts will be an array with format:

```js
posts = [
  {
    post: {
      //Content from a posts table
      id: 5,
      title: 'some',
      creator_id: 2,
    },
    creator: {
      //Content from a users table
      id: 2,
      login: 'some',
      avatar_id: 100,
    },
    avatar: {
      //Content from a avatars table
      id: 100,
      path: 'dsd',
    },
  },
  {
    //..Other post
  },
]
```

So this is similar to a mapper, but this format sometimes helps when you don't need a structured data so you will have flatten data
