// Add reaction controller
// import dependencies
import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from 'http-status-codes'
import {
  IReactionDocument,
  IReactionJob,
} from '@reaction/interfaces/reaction.interface'
import { ReactionCache } from '@service/redis/reaction.cache'
import { joiValidation } from '@global/decorators/joiValidation.decorators'
import { addReactionSchema } from '@reaction/schemes/reaction.schemes'

const reactionCache: ReactionCache = new ReactionCache()

export class Add {
  // Add reaction
  @joiValidation(addReactionSchema)
  public async reaction(req: Request, res: Response): Promise<void> {
    const {
      userTo,
      postId,
      type,
      previousReaction,
      postReactions,
      profilePicture,
    } = req.body
    const reactionObject: IReactionDocument = {
      _id: new ObjectId(),
      postId,
      type,
      avatarColor: req.currentUser!.avatarColor,
      username: req.currentUser!.username,
      profilePicture,
    } as IReactionDocument

    // Add reaction to cache
    await reactionCache.savePostReactionToCache(
      postId,
      reactionObject,
      postReactions,
      type,
      previousReaction
    )
    // Send http response
    res.status(HTTP_STATUS.OK).json({ message: 'Reaction added successfully' })
  }
}
