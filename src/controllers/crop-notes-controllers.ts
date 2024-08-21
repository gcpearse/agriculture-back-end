import { NextFunction, Response } from "express"
import { ExtendedRequest } from "../types/auth-types"
import { selectCropNotesByCropId } from "../models/crop-notes-models"


export const getCropNotesByCropId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  const { crop_id } = req.params

  try {
    const cropNotes = await selectCropNotesByCropId(authUserId, +crop_id)
    res.status(200).send({ cropNotes })
  } catch (err) {
    next(err)
  }
}
