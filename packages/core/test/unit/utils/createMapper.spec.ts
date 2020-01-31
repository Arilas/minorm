import { createMapper } from '../../../src/utils/createMapper'

describe('Unit', () => {
  describe('Utils', () => {
    describe('createMapper', () => {
      const creator = {
        id: 1,
        user: true,
        avatar_id: 1,
      }

      const post = {
        id: 1,
        creator_id: 1,
        post: true,
      }

      const avatar = {
        id: 1,
        user_id: 1,
        avatar: true,
      }

      const lastComment = {
        id: 1,
        lastComment: true,
      }

      const category = {
        id: 1,
        category: true,
      }

      const company = {
        id: 1,
        company: true,
      }

      test('should map entity without includes', () => {
        const mapper = createMapper()
        mapper.setEntryPoint('post')
        const postEntity = mapper.map({
          post,
        })
        expect(postEntity).toEqual(post)
      })
      test('should map entities with one include', () => {
        const mapper = createMapper()
        mapper.setEntryPoint('post')
        mapper.setRelation('post', 'creator')
        const postEntity = mapper.map({
          post,
          creator,
        })
        expect(postEntity).toEqual({
          ...post,
          creator,
        })
      })
      test('should map entities with nested includes', () => {
        const mapper = createMapper()
        mapper.setEntryPoint('post')
        mapper.setRelation('post', 'creator')
        mapper.setRelation('creator', 'avatar')
        const postEntity = mapper.map({
          post,
          creator,
          avatar,
        })
        expect(postEntity).toEqual({
          ...post,
          creator: {
            ...creator,
            avatar,
          },
        })
      })
      test('should map entities with nested try includes', () => {
        const mapper = createMapper()
        mapper.setEntryPoint('post')
        mapper.setRelation('post', 'creator')
        mapper.setRelation('creator', 'avatar')
        const postEntity = mapper.map({
          post,
          creator,
          avatar: {
            id: null,
          },
        })
        expect(postEntity).toEqual({
          ...post,
          creator: {
            ...creator,
            avatar: null,
          },
        })
      })
      test('should map entities with multiple nested includes', () => {
        const mapper = createMapper()
        mapper.setEntryPoint('post')
        mapper.setRelation('post', 'creator')
        mapper.setRelation('creator', 'avatar')
        mapper.setRelation('post', 'category')
        mapper.setRelation('category', 'company')
        mapper.setRelation('post', 'lastComment')
        const postEntity = mapper.map({
          post,
          creator,
          avatar,
          category,
          company,
          lastComment,
        })
        expect(postEntity).toEqual({
          ...post,
          creator: {
            ...creator,
            avatar,
          },
          category: {
            ...category,
            company,
          },
          lastComment,
        })
      })

      test('should map entities with missing one include', () => {
        const mapper = createMapper()
        mapper.setEntryPoint('post')
        mapper.setRelation('post', 'creator')
        const postEntity = mapper.map({
          post,
          creator: null,
        })
        expect(postEntity).toEqual({
          ...post,
          creator: null,
        })
      })
      test('should map entities with missing nested includes', () => {
        const mapper = createMapper()
        mapper.setEntryPoint('post')
        mapper.setRelation('post', 'creator')
        mapper.setRelation('creator', 'avatar')
        const postEntity = mapper.map({
          post,
          creator: null,
          avatar: null,
        })
        expect(postEntity).toEqual({
          ...post,
          creator: null,
        })
      })
      test('should map entities with missing some of multiple nested includes', () => {
        const mapper = createMapper()
        mapper.setEntryPoint('post')
        mapper.setRelation('post', 'creator')
        mapper.setRelation('creator', 'avatar')
        mapper.setRelation('post', 'category')
        mapper.setRelation('category', 'company')
        mapper.setRelation('post', 'lastComment')
        const postEntity = mapper.map({
          post,
          creator,
          avatar,
          category: null,
          company: null,
          lastComment: null,
        })
        expect(postEntity).toEqual({
          ...post,
          creator: {
            ...creator,
            avatar,
          },
          category: null,
          lastComment: null,
        })
      })

      test('should map entities with one include and named selects', () => {
        const mapper = createMapper()
        mapper.setEntryPoint('post')
        mapper.setRelation('post', 'creator')
        const postEntity = mapper.map({
          post,
          creator,
          '': {
            named: true,
          },
        })
        expect(postEntity).toEqual({
          ...post,
          named: true,
          creator,
        })
      })
    })
  })
})
