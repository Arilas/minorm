# Models

A Model is an object with attached helpers.

In this article, we will use the same posts table which have fields: id, title, and creator_id.

## Insertion or Updating the model

```js
const post = repo.create({
  title: 'foo',
  creator_id: 5,
})
await post.save()
console.log(post.id)
```

In the example above we inserted record and receiver id of post. If we need to update the same record we can use:

```js
post.title = 'bar'
await post.save()
```

So we directly changed property and called a save method. Please note that the model can have other fields that are not represented in the database, and minorm will just ignore them. For example, let's create a model and save it with non-existing fields:

```js
const post = repo.create({
  title: 'Foo',
  creator_id: user.id,
  creator: user,
  signature: `${user.firstName} ${user.lastName}`,
})
await post.save()
console.log(post.id)
console.log(post.signature)
```

As is described at the beginning of this article there's no any creator object or signature fields in the original table and minorm knows it, so it compares only known columns to calculate changes needed to be inserted or updated.

This can be useful for returning result from the server or for having some hierarchy data.

If you need to populate fetched model with a data you can also use `populate()` method. For example:

```js
const post = repo.find(5)
if (post !== null) {
  post.populate({
    title: 'some',
    creator_id: 5,
  })
  await post.save()
}
```

## State helpers

There's two methods `isDirty()` and `getChanges()` that can be used to determine the state of the Model.

- `isDirty()` returns boolean that can tells you that there's some changes in a model that needs to be saved
- `getChanges()` returns an object containing all fields that was changed from original state

## Remove

If you need to remove record from the database you can use `remove()` method on it. For example:

```js
const post = await repo.find(5)
if (post !== null) {
  await post.remove()
}
```

## Refresh

If you need to refresh the state of a model you can use `refresh()` method. If will fetch record from the database and update your model. It's useful when you have some fields that can be populated by `INSERT` or `UPDATE` in database, these changes is not basically reflected after `save()` execution
