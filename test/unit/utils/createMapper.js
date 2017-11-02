/** @flow */
import {assert} from 'chai'
import { createMapper } from '../../../src/utils/createMapper'

describe('Unit', () => {
  describe('Utils', () => {
    describe('createMapper', () => {
      it('should build map without includes', () => {
        const mapper = createMapper()
        mapper.setEntryPoint('user')
        assert.deepEqual(mapper.build(), {})
      })
      it('should build map with one include', () => {
        const mapper = createMapper()
        mapper.setEntryPoint('post')
        mapper.setRelation('post', 'creator')
        assert.deepEqual(mapper.build(), { creator: {}})
      })
      it('should build map with nested includes', () => {
        const mapper = createMapper()
        mapper.setEntryPoint('post')
        mapper.setRelation('post', 'creator')
        mapper.setRelation('creator', 'avatar')
        assert.deepEqual(mapper.build(), { creator: { avatar: {} }})
      })
      it('should build map with multiple nested includes', () => {
        const mapper = createMapper()
        mapper.setEntryPoint('post')
        mapper.setRelation('post', 'creator')
        mapper.setRelation('post', 'category')
        mapper.setRelation('post', 'lastComment')
        mapper.setRelation('creator', 'avatar')
        mapper.setRelation('category', 'company')
        assert.deepEqual(mapper.build(), { creator: { avatar: {} }, category: { company: {} }, lastComment: {}})
      })

      const creator = {
        user: true
      }

      const post = {
        post: true
      }

      const avatar = {
        avatar: true
      }

      const lastComment = {
        lastComment: true
      }

      const category = {
        category: true
      }

      const company = {
        company: true
      }

      it('should map entity without includes', () => {
        const mapper = createMapper()
        mapper.setEntryPoint('post')
        const postEntity = mapper.map({
          post
        })
        assert.deepEqual(postEntity, post)
      })
      it('should map entities with one include', () => {
        const mapper = createMapper()
        mapper.setEntryPoint('post')
        mapper.setRelation('post', 'creator')
        const postEntity = mapper.map({
          post,
          creator
        })
        assert.deepEqual(postEntity, {
          ...post,
          creator
        })
      })
      it('should map entities with nested includes', () => {
        const mapper = createMapper()
        mapper.setEntryPoint('post')
        mapper.setRelation('post', 'creator')
        mapper.setRelation('creator', 'avatar')
        const postEntity = mapper.map({
          post,
          creator,
          avatar
        })
        assert.deepEqual(postEntity, {
          ...post,
          creator: {
            ...creator,
            avatar
          }
        })
      })
      it('should map entities with multiple nested includes', () => {
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
          lastComment
        })
        assert.deepEqual(postEntity, {
          ...post,
          creator: {
            ...creator,
            avatar
          },
          category: {
            ...category,
            company
          },
          lastComment
        })
      })

      it('should map entities with missing one include', () => {
        const mapper = createMapper()
        mapper.setEntryPoint('post')
        mapper.setRelation('post', 'creator')
        const postEntity = mapper.map({
          post,
          creator: null
        })
        assert.deepEqual(postEntity, {
          ...post,
          creator: null
        })
      })
      it('should map entities with missing nested includes', () => {
        const mapper = createMapper()
        mapper.setEntryPoint('post')
        mapper.setRelation('post', 'creator')
        mapper.setRelation('creator', 'avatar')
        const postEntity = mapper.map({
          post,
          creator: null,
          avatar: null
        })
        assert.deepEqual(postEntity, {
          ...post,
          creator: null
        })
      })
      it('should map entities with missing some of multiple nested includes', () => {
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
          lastComment: null
        })
        assert.deepEqual(postEntity, {
          ...post,
          creator: {
            ...creator,
            avatar
          },
          category: null,
          lastComment: null
        })

      })

      it('should map entities with one include and named selects', () => {
        const mapper = createMapper()
        mapper.setEntryPoint('post')
        mapper.setRelation('post', 'creator')
        const postEntity = mapper.map({
          post,
          creator,
          '': {
            named: true
          }
        })
        assert.deepEqual(postEntity, {
          ...post,
          named: true,
          creator
        })
      })

    })
  })

})