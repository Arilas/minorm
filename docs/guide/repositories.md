# Repositories

The Repository is a wrapper around any table that you have in the database. It provides basic methods for querying data from corresponding table like `find()`, `findOneBy()` and `findBy()` and also methods to mutate it like `insert()`, `update()` or `remove`.

To create a Repository for a table you need to call the method `getRepository()` from a manager. For example, we will create a Repository for a table `posts`. To do this we will create file `models/posts.js` and put the following content:

```js
import { manager } from './models'

const repo = manager.getRepository('posts')

export default repo
```

That's it. You don't need to manually type anything or use some magic classes.

## Querying data

To find a record by id you can use `find(id)` method. For example:

```js
import PostRepo from './models/posts'

async function get() {
  const post = await PostRepo.find(5)
  if (post === null) {
    throw new Error('Post not found')
  }

  return post
}
```

Execution of `find()` method will execute following SQL query:

```sql
SELECT * FROM posts WHERE (id = ?) LIMIT 1
```

If you need to find a record with more conditions, you can use `findOneBy(criteria)` method. For example, you need to find a record with status either ACTIVE or DRAFT, and also title is foo and the creator is not the current user:

```js
import PostRepo from './models/posts'

async function getDuplicate(userId) {
  const post = await PostRepo.findOneBy({
    status: {
      $in: ['ACTIVE', 'DRAFT'],
    },
    title: 'foo',
    creator_id: {
      $not: userId,
    },
  })

  return post
}
```

The same request
in SQL:

```sql
SELECT * FROM posts WHERE (status IN (?,?)) AND (title = ?) AND (creator_id = ?) LIMIT 1
```

When you need to receive an array of records with a condition like in the previous example you can use `findBy(criteria, orderBy, limit, offset)` method. For example:

```js
import PostRepo from './models/posts'

async function getUserPosts(userId) {
  const posts = await PostRepo.findBy({
    status: {
      $in: ['ACTIVE', 'DRAFT'],
    },
    creator_id: userId,
  })

  return posts
}
```

The same request
in SQL:

```sql
SELECT * FROM posts WHERE (status IN (?,?)) AND (creator_id = ?)
```

## Manual insertion

It's recommended to use Models to execute insertion to the table, but in case you need to manually insert data to table you can use an `insert(data)` method. For example:

```js
import PostRepo from './models/posts'

async function insertPost() {
  try {
    const result = await PostRepo.insert({
      title: 'My post',
      status: 'DRAFT',
      creator_id: 5,
    })

    return result.insertedId
  } catch (err) {
    // there's an error with your request
  }
}
```

The same in SQL:

```sql
INSERT INTO posts (title, status, creator_id) VALUES (?, ?, ?)
```

## Manual update

We still recommend to use models for this, but if you still need to manually update record or records you can use `update(idOrCriteria, changes)` method. For example:

```js
import PostRepo from './models/posts'

async function updatePost(postId) {
  try {
    const result = await PostRepo.update(postId, {
      title: 'My post',
      status: 'DRAFT',
      creator_id: 5,
    })

    return result.affectedRows
  } catch (err) {
    // there's an error with your request
  }
}
```

The same in SQL:

```sql
UPDATE posts SET title = ?, status = ?, creator_id = ? WHERE (id = ?)
```

Also, it's possible to use complex criteria instead of `id`. Example of this option is described in `findOneBy` and `findBy` methods.

## Manual records removing

We highly recommend to use model methods to do it, but in case you need to manually execute it or you need to remove many records at once you can use `remove(idOrCriteria)` method.

The first argument receives id or criteria.

The method returns an object with `affectedRows` value

## Models

You can work with records in your database using models. All `find*` methods return models with additional methods.

To create a new model for a record you will need to call `create(data)` method. For example:

```js
import PostRepo from './models/posts'

async function insertPost(post) {
  const post = PostRepo.create(post)
  await post.save()
  console.log(post.id) // model receive id after insertion

  return post
}
```

You may also need to have the ability to wrap received a record from a database fetched from query builder or by another way. For these purposes, there's a `hydrate(data, isSaved)` method. Please be accurate with this method, because if `isSaved` is true, the model will calculate changes from the original data object.

## Starting Select Query Builder

If you need to use Query builder there's a method `startQuery(optionalAlias)` that you can use to start a query with pre-populated from the part by a table name and select with an asterisk (or with an alias.\* if the alias is inset)
