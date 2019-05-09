import { Manager } from '../../../src/createManager'
import { SomeRecord } from '../../../src/types'
import { ModelMethods } from '../../../src/createModel'

export interface UserRaw extends SomeRecord {
  login: string
  password: string
}

export type User = UserRaw & ModelMethods<UserRaw>

export interface PostRaw extends SomeRecord {
  title: string
  body: string
  creator_id: number
}

export type Post = PostRaw & ModelMethods<PostRaw>

export interface CommentRaw extends SomeRecord {
  body: string
  creator_id: number
  post_id: number
}

export type Comment = CommentRaw & ModelMethods<CommentRaw>

function randomString() {
  return Math.random()
    .toString(36)
    .substring(7)
}

function range(from: number, to: number): number[] {
  return Array.from(
    new Uint32Array(to - from + 1).map((_, index) => index + from),
  )
}

export function createFixtureManager(manager: Manager) {
  let usersCount = 0

  function createUser(): Promise<User> {
    return manager
      .getRepository('users')
      .create({
        login: 'user' + ++usersCount,
        password: randomString(),
      })
      .save()
  }

  function createUsers(count: number = 1): Promise<User[]> {
    return Promise.all(range(0, count).map(createUser))
  }

  function createPostToUser(id: number): Promise<Post> {
    return manager
      .getRepository('posts')
      .create({
        title: 'post ' + randomString(),
        body: randomString(),
        creator_id: id,
      })
      .save()
  }

  async function createPost(): Promise<Post> {
    const user = await createUser()
    return createPostToUser(user.id)
  }

  function createPostsToUser(count: number = 1, id: number): Promise<Post[]> {
    return Promise.all(range(0, count).map(createPostToUser.bind(id)))
  }

  async function createPosts(
    usersCount: number = 1,
    postsPerUser: number = 1,
  ): Promise<Post[][]> {
    const users = await createUsers(usersCount)
    return Promise.all(
      users.map(user => createPostsToUser(postsPerUser, user.id)),
    )
  }

  function createPostComment(postId: number, userId: number): Promise<Comment> {
    return manager
      .getRepository('comments')
      .create({
        creator_id: userId,
        post_id: postId,
        body: randomString(),
      })
      .save()
  }

  async function createPostCommentWithUser(postId: number): Promise<Comment> {
    const user = await createUser()
    return createPostComment(postId, user.id)
  }

  async function createPostWithComments(count: number = 1): Promise<Comment[]> {
    const post = await createPost()
    return Promise.all(
      range(0, count).map(createPostCommentWithUser.bind(post.id)),
    )
  }

  return {
    createUser,
    createUsers,

    createPost,
    createPostsToUser,
    createPosts,

    createPostComment,
    createPostCommentWithUser,
    createPostWithComments,
  }
}
