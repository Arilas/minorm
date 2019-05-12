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
