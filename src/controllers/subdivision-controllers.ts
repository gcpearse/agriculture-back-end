import { RequestHandler } from "express"
import { selectSubdivisionsByPlotId } from "../models/subdivision-models"


export const getSubdivisionsByPlotId: RequestHandler = async (req, res, next) => {

  const authUserId: number = req.body.user.user_id

  const { plot_id } = req.params

  const queries = req.query

  try {
    const subdivisions = await selectSubdivisionsByPlotId(authUserId, +plot_id, queries)
    res.status(200).send({ subdivisions })
  } catch (err) {
    next(err)
  }
}
