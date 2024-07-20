import { RequestHandler } from "express"
import { insertPlotByOwner, removePlotByPlotId, selectPlotByPlotId, selectPlotsByOwner, updatePlotByPlotId } from "../models/plot-models"


export const getPlotsByOwner: RequestHandler = async (req, res, next) => {

  const authUserId: number = req.body.user.user_id

  const { owner_id } = req.params

  try {
    const plots = await selectPlotsByOwner(authUserId, +owner_id, req.query)
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

  const { plot_id } = req.params

  try {
    const plot = await selectPlotByPlotId(authUserId, +plot_id)
    res.status(200).send({ plot })
  } catch (err) {
    next(err)
  }
}


export const patchPlotByPlotId: RequestHandler = async (req, res, next) => {

  const authUserId: number = req.body.user.user_id

  const { plot_id } = req.params

  try {
    const plot = await updatePlotByPlotId(authUserId, +plot_id, req.body)
    res.status(200).send({ plot })
  } catch (err) {
    next(err)
  }
}


export const deletePlotByPlotId: RequestHandler = async (req, res, next) => {

  const authUserId: number = req.body.user.user_id

  const { plot_id } = req.params

  try {
    await removePlotByPlotId(authUserId, +plot_id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
