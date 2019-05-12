# Query Builder

Minorm uses extended version of [squel](https://github.com/hiddentao/squel) Query Builder. You can check their docs to have more understanding of all functionality in it.

## SELECT queries

To start a query you can use any of two options:

```js
const query = repo.startQuery('post')
```

or equally same version from a Manager:

```js
const query = manager
  .startQuery()
  .select()
  .field('post.*')
  .from('posts', 'post')
```

Both are equal to the following SQL (to test purposes you can call `toString()` on query builder instance):

```sql
SELECT post.* FROM posts post
```

### Adding conditions to WHERE part

To add a condition you can use squel `where('some = ?', value)` functions or you can use `criteria()` function provided by minorm. For example lets add condition that status is either of ACTIVE or DRAFT, and creator_id is 5.

```js
query.criteria({
  'post.status': {
    $in: ['ACTIVE', 'DRAFT'],
  },
  'post.creator_id': 5,
})
```

Which in result will have following SQL:

```sql
SELECT post.* FROM posts post WHERE (post.status IN (?, ?)) AND (post.creator_id = ?)
```

### Using JOIN clauses

To add `INNER JOIN` you can use squel `join('tableToJoin', 'joinedTableAlias', 'alias.someField = joinedTableAlias.id')` or you can minorm helper `include('alias', 'someField')` which is the equivalent. Minorm know all relations in your database so it can use it to help you fetch information.

For example let's add reference to our post creator:

```js
query.field('creator.*').include('post', 'creator_id', 'creator')
```

The third parameter is optional and by default it's uses your column name with removed `_id` part. So we can change it to:

```js
query.field('creator.*').include('post', 'creator_id')
```

This is an equivalent of squel:

```js
query
  .field('creator.*')
  .join('users', 'creator', 'post.creator_id = creator.id')
```

All examples will lead to the following SQL:

```sql
SELECT post.*, creator.* FROM posts post INNER JOIN users creator ON (post.creator_id = creator.id) WHERE (post.status IN (?, ?)) AND (post.creator_id = ?)
```

In case that you need `LEFT JOIN` you can use `tryInclude()` helper with is equivalent of `left_join()`.

For example creator may have an avatar and if it's exists in database we need to receive it. Let's add it to our query:

```js
query.field('avatar.*').tryInclude('creator', 'avatar_id')
```

`tryInclude()` also can receive third parameter to make an alias

This is an equivalent of squel:

```js
query
  .field('avatar.*')
  .left_join('avatars', 'avatar', 'creator.avatar_id = avatar.id')
```

All examples will lead to the following SQL:

```sql
SELECT post.*, creator.*
FROM posts post
  INNER JOIN users creator ON (post.creator_id = creator.id)
  LEFT JOIN avatars avatar ON (creator.avatar_id = avatar.id)
WHERE (post.status IN (?, ?)) AND (post.creator_id = ?)
```

### Execution

If you have simple query without JOIN clauses you can use `execute()` method which will execute query and return result.

For example:

```js
const posts = await repo
  .startQuery('post')
  .limit(10)
  .offset(30)
  .execute()

for (const post of posts) {
  //Do something with post
}
```

In case of complex query with includes you can use some sort of magic to receive data in hierarchy format. For example let's execute our example from previous steps:

```js
const postsWithCreatorsAndAvatars = await query
  .where('id = ?', 5)
  .getMapper()
  .fetch()

for (const post of postsWithCreatorsAndAvatars) {
  expect(post).toMatchObject({
    id: 5,
    title: 'foo',
    creator_id: 10,
    creator: {
      id: 10,
      login: 'some',
      avatar_id: 20,
      avatar: {
        // OR null if there's no avatar set
        id: 20,
        path: 'some',
      },
    },
  })
}
```

So as you can see minorm follows the way that you used to describe your relations in a query.

If you don't need to use this data in hierarchy way you can also use this mechanism:

```js
const posts = await query.execute(true)

for (const postRow of posts) {
  const { post, creator, avatar } = postRow
  expect(post).toMatchObject({
    id: 5,
    title: 'foo',
    creator_id: 10,
  })
  expect(creator).toMatchObject({
    id: 10,
    login: 'some',
    avatar_id: 20,
  })
  expect(avatar).toMatchObject({
    id: 20,
    path: 'some',
  })
}
```

Please note that in this case when there's no any record from `LEFT JOIN` it will return object with all columns with `null` values. So in this example it's wrong to check `if (avatar !== null)` because it will be always an object.

Please also note that if you have some calculations in your query it will result as a object with key `''`. So for example you added calculation for count. To access it you will need to use:

```js
const { count } = postRow['']
```

This is limitation of `mysql2`
