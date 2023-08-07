// Controlelr to get images
// Import dependencies
import { IFileImageDocument } from '@image/interfaces/image.interface'
import { imageService } from '@service/db/image.service'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

export class Get {
  // Method to get images
  public async images(req: Request, res: Response): Promise<void> {
    // Get images from the database
    const images: IFileImageDocument[] = await imageService.getImages(
      req.params.userId
    )
    // Send response
    res.status(HTTP_STATUS.OK).json({ message: 'User images', images })
  }
}
