/** @flow */
import type {Manager} from '../../../src/types'

function randomString() {
  return Math.random().toString(36).substring(7)
}

function range(from, to) {
  return Array.from(new Uint32Array(to - from + 1).map((val, index) => index + from))
}

export function createFixtureManager(manager: Manager) {

  let usersCount = 0

  function createUser() {
    return manager.getRepository('users')
      .create({
        login: 'user' + (++usersCount),
        password: randomString()
      })
      .save()
  }

  function createUsers(count = 1) {
    return Promise.all(range(0, count).map(createUser))
  }

  function createPostToUser(id) {
    return manager.getRepository('posts')
      .create({
        title: 'post ' + randomString(),
        body: randomString(),
        creator_id: id
      })
      .save()
  }

  async function createPost() {
    const user = await createUser()
    return createPostToUser(user.id)
  }

  function createPostsToUser(count = 1, id) {
    return Promise.all(range(0, count).map(createPostsToUser.bind(id)))
  }

  async function createPosts(userCount = 1, postsPerUser = 1) {
    const users = await createUsers(usersCount)
    return Promise.all(users.map(user => createPostsToUser(postsPerUser, user.id)))
  }

  function createPostComment(postId, userId) {
    return manager.getRepository('comments')
      .create({
        creator_id: userId,
        post_id: postId,
        body: randomString()
      })
      .save()
  }

  async function createPostCommentWithUser(postId) {
    const user = await createUser()
    return createPostComment(postId, user.id)
  }

  async function createPostWithComments(count = 1) {
    const post = await createPost()
    return Promise.all(range(0, count).map(createPostCommentWithUser.bind(post.id)))
  }

  return {
    createUser,
    createUsers,

    createPost,
    createPostsToUser,
    createPosts,

    createPostComment,
    createPostCommentWithUser,
    createPostWithComments
  }
}
