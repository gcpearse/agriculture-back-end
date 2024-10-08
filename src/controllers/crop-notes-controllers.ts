import { NextFunction, Response } from "express"
import { ExtendedRequest } from "../types/auth-types"
import { insertCropNoteByCropId, removeCropNoteByNoteId, removeCropNotesByCropId, selectCropNotesByCropId, updateCropNoteByNoteId } from "../models/crop-notes-models"


export const getCropNotesByCropId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  const { crop_id } = req.params

  try {
    const notes = await selectCropNotesByCropId(authUserId, +crop_id)
    res.status(200).send({ notes })
  } catch (err) {
    next(err)
  }
}


export const postCropNoteByCropId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  const { crop_id } = req.params

  try {
    const note = await insertCropNoteByCropId(authUserId, +crop_id, req.body)
    res.status(201).send({ note })
  } catch (err) {
    next(err)
  }
}


export const deleteCropNotesByCropId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  const { crop_id } = req.params

  try {
    await removeCropNotesByCropId(authUserId, +crop_id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}


export const patchCropNoteByNoteId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  const { note_id } = req.params

  try {
    const note = await updateCropNoteByNoteId(authUserId, +note_id, req.body)
    res.status(200).send({ note })
  } catch (err) {
    next(err)
  }
}


export const deleteCropNoteByNoteId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  const { note_id } = req.params

  try {
    await removeCropNoteByNoteId(authUserId, +note_id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
