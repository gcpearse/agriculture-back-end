import { RequestHandler } from "express"
import { insertSubdivisionByPlotId, selectSubdivisionBySubdivisionId, selectSubdivisionsByPlotId } from "../models/subdivision-models"


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


export const postSubdivisionByPlotId: RequestHandler = async (req, res, next) => {

  const authUserId: number = req.body.user.user_id

  const { plot_id } = req.params

  try {
    const subdivision = await insertSubdivisionByPlotId(authUserId, +plot_id, req.body)
    res.status(201).send({ subdivision })
  } catch (err) {
    next(err)
  }
}


export const getSubdivisionBySubdivisionId: RequestHandler = async (req, res, next) => {

  const authUserId: number = req.body.user.user_id

  const { subdivision_id } = req.params

  try {
    const subdivision = await selectSubdivisionBySubdivisionId(authUserId, +subdivision_id)
    res.status(200).send({ subdivision })
  } catch (err) {
    next(err)
  }
}
