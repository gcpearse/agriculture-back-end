import { RequestHandler } from "express"
import { insertCropByPlotId, selectCropsByPlotId } from "../models/crop-models"


export const getCropsByPlotId: RequestHandler = async (req, res, next) => {

  const authUserId: number = req.body.user.user_id

  const { plot_id } = req.params

  try {
    const [crops, count] = await selectCropsByPlotId(authUserId, +plot_id, req.query)
    res.status(200).send({ crops, count })
  } catch (err) {
    next(err)
  }
}


export const postCropByPlotId: RequestHandler = async (req, res, next) => {

  const authUserId: number = req.body.user.user_id

  const { plot_id } = req.params

  try {
    const crop = await insertCropByPlotId(authUserId, +plot_id, req.body)
    res.status(201).send({ crop })
  } catch (err) {
    next(err)
  }
}
