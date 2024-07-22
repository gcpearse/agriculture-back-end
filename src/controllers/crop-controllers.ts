import { NextFunction, Response } from "express"
import { insertCropByPlotId, selectCropsByPlotId, selectCropsBySubdivisionId } from "../models/crop-models"
import { ExtendedRequest } from "../types/auth-types"


export const getCropsByPlotId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId: number = req.user!.user_id

  const { plot_id } = req.params

  try {
    const [crops, count] = await selectCropsByPlotId(authUserId, +plot_id, req.query)
    res.status(200).send({ crops, count })
  } catch (err) {
    next(err)
  }
}


export const postCropByPlotId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId: number = req.user!.user_id

  const { plot_id } = req.params

  try {
    const crop = await insertCropByPlotId(authUserId, +plot_id, req.body)
    res.status(201).send({ crop })
  } catch (err) {
    next(err)
  }
}


export const getCropsBySubdivisionId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId: number = req.user!.user_id

  const { subdivision_id } = req.params

  try {
    const [crops, count] = await selectCropsBySubdivisionId(authUserId, +subdivision_id, req.query)
    res.status(200).send({ crops, count })
  } catch (err) {
    next(err)
  }
}
