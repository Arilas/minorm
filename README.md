# MinORM

MinORM is a high-performance ORM built on top of [Node MySQL2](https://github.com/sidorares/node-mysql2)
that is a continuation of Node MySQL-Native.

It's really lightweight, provide simple solutions that just works without a lot of configurations.

## Installation and usage

```npm install --save minorm```

```js
import {createManager} from 'minorm'

export const manager = createManager({
  //options like for MySQL2 pool creation
})

export const PostsRepo = {
  ...manager.getRepository('posts'),
  async getPostsFromUser(id) {
    const postQuery = manager.startQuery().select()
      .field('post.*')
      .from('posts', 'post')
      .include('post', 'creator_id')
      .tryInclude('creator', 'avatar_id')
      .where('post.creator_id = ?', id)
    const [result] = await manager.nestQuery(postQuery)
    return result.map(({post, creator}) => ({
      ...post,
      creator
    }))
  }
}
```
