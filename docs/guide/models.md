# Models

Model is an object with attached helpers.

In this article we will use the same posts table which have fileds: id, title and creator_id.

## Insertion or Updating the model

```js
const post = repo.create({
  title: 'foo',
  creator_id: 5
})
await post.save()
console.log(post.id)
```

In example above we inserted record and receiver id of post. If we need to update the same record we can use:

```js
post.title = 'bar'
await post.save()
```

So we directly changed property and called save method. Please note that model can have other fields that are not represented in database, and minorm will just ignore them. For example lets create model and save it with non-existing fields:

```js
const post = repo.create({
  title: 'Foo',
  creator_id: user.id,
  creator: user,
  signature: `${user.firstName} ${user.lastName}`
})
await post.save()
console.log(post.id)
console.log(post.signature)
```

As it described in the beggining of this article there's no any creator object or signature fields in original table and minorm knows it, so it's compare only known columns to calculate changes needed to be inserted or updated.

This can be useful for returning result from server or for having some hierarchy data.
