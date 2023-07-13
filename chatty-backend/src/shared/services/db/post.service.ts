// Post related db servcices
// import dependencies
import {
  IPostDocument,
  IGetPostsQuery,
  IQueryComplete,
  IQueryDeleted,
} from '@post/interfaces/post.interface'
import { PostModel } from '@post/models/post.schema'
import { IUserDocument } from '@user/interfaces/user.interface'
import { UserModel } from '@user/models/user.schema'
import { Query, UpdateQuery } from 'mongoose'

class PostService {
  // Create post and save to db
  public async addPostToDB(
    userId: string,
    createdPost: IPostDocument
  ): Promise<void> {
    const post: Promise<IPostDocument> = PostModel.create(createdPost)
    const user: UpdateQuery<IUserDocument> = UserModel.updateOne(
      { _id: userId },
      { $inc: { postsCount: 1 } }
    )
    await Promise.all([post, user])
  }

  // Get posts from db
  public async getPosts(
    query: IGetPostsQuery,
    skip = 0,
    limit = 0,
    sort: Record<string, 1 | -1>
  ): Promise<IPostDocument[]> {
    let postQuery = {}
    if (query?.imgId && query?.gifUrl) {
      postQuery = { $or: [{ imgId: { $ne: '' } }, { gifUrl: { $ne: '' } }] }
    } else if (query?.videoId) {
      postQuery = { $or: [{ videoId: { $ne: '' } }] }
    } else {
      postQuery = query
    }
    const posts: IPostDocument[] = await PostModel.aggregate([
      { $match: postQuery },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
    ])
    return posts
  }

  // Get post count from db
  public async postsCount(): Promise<number> {
    const count: number = await PostModel.find({}).countDocuments()
    return count
  }

  // Delete post from db
  public async deletePost(postId: string, userId: string): Promise<void> {
    const deletePost: Query<IQueryComplete & IQueryDeleted, IPostDocument> =
      PostModel.deleteOne({ _id: postId })
    // delete reactions here
    const decrementPostCount: UpdateQuery<IUserDocument> = UserModel.updateOne(
      { _id: userId },
      { $inc: { postsCount: -1 } }
    )
    await Promise.all([deletePost, decrementPostCount])
  }

  // Edit post in db
  public async editPost(
    postId: string,
    updatedPost: IPostDocument
  ): Promise<void> {
    const updatePost: UpdateQuery<IPostDocument> = PostModel.updateOne(
      { _id: postId },
      { $set: updatedPost }
    )
    await Promise.all([updatePost])
  }
}

export const postService: PostService = new PostService()
