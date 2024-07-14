import { RequestHandler } from "express"
import { selectPlotsByOwner } from "../models/plot-models"


export const getPlotsByOwner: RequestHandler = async (req, res, next) => {

  const authUserId: number = req.body.user.user_id

  const { owner_id } = req.params

  try {
    const plots = await selectPlotsByOwner(authUserId, +owner_id)
    res.status(200).send({ plots })
  } catch (err) {
    next(err)
  }
}
