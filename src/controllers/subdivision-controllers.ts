import { RequestHandler } from "express"
import { insertSubdivisionByPlotId, removeSubdivisionBySubdivisionId, selectSubdivisionBySubdivisionId, selectSubdivisionsByPlotId, updateSubdivisionBySubdivisionId } from "../models/subdivision-models"


export const getSubdivisionsByPlotId: RequestHandler = async (req, res, next) => {

  const authUserId: number = req.body.user.user_id

  const { plot_id } = req.params

  try {
    const subdivisions = await selectSubdivisionsByPlotId(authUserId, +plot_id, req.query)
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


export const patchSubdivisionBySubdivisionId: RequestHandler = async (req, res, next) => {

  const authUserId: number = req.body.user.user_id

  const { subdivision_id } = req.params

  try {
    const subdivision = await updateSubdivisionBySubdivisionId(authUserId, +subdivision_id, req.body)
    res.status(200).send({ subdivision })
  } catch (err) {
    next(err)
  }
}


export const deleteSubdivisionBySubdivisionId: RequestHandler = async (req, res, next) => {

  const authUserId: number = req.body.user.user_id

  const { subdivision_id } = req.params

  try {
    await removeSubdivisionBySubdivisionId(authUserId, +subdivision_id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
