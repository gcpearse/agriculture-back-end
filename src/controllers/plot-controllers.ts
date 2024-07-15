import { RequestHandler } from "express"
import { insertPlotByOwner, selectPlotByPlotId, selectPlotsByOwner } from "../models/plot-models"


export const getPlotsByOwner: RequestHandler = async (req, res, next) => {

  const authUserId: number = req.body.user.user_id

  const { owner_id } = req.params

  const queries = req.query

  try {
    const plots = await selectPlotsByOwner(authUserId, +owner_id, queries)
    res.status(200).send({ plots })
  } catch (err) {
    next(err)
  }
}


export const postPlotByOwner: RequestHandler = async (req, res, next) => {

  const authUserId: number = req.body.user.user_id

  const { owner_id } = req.params

  try {
    const plot = await insertPlotByOwner(authUserId, +owner_id, req.body)
    res.status(201).send({ plot })
  } catch (err) {
    next(err)
  }
}


export const getPlotByPlotId: RequestHandler = async (req, res, next) => {

  const authUserId: number = req.body.user.user_id

  const { owner_id, plot_id } = req.params

  try {
    const plot = await selectPlotByPlotId(authUserId, +owner_id, +plot_id)
    res.status(200).send({ plot })
  } catch (err) {
    next(err)
  }
}
