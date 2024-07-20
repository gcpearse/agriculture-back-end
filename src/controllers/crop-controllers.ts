import { RequestHandler } from "express"
import { selectCropsByPlotId } from "../models/crop-models"


export const getCropsByPlotId: RequestHandler = async (req, res, next) => {

  const authUserId: number = req.body.user.user_id

  const { plot_id } = req.params

  try {
    const crops = await selectCropsByPlotId(authUserId, +plot_id, req.query)
    res.status(200).send({ crops })
  } catch (err) {
    next(err)
  }
}
