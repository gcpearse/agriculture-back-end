import { NextFunction, Response } from "express"
import { insertPlotByOwner, removePlotByPlotId, selectPinnedPlotsByOwner, selectPlotByPlotId, selectPlotsByOwner, setIsPinnedByPlotId, unsetIsPinnedByPlotId, updatePlotByPlotId } from "../models/plots-models"
import { ExtendedRequest } from "../types/auth-types"


export const getPlotsByOwner = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  const { owner_id } = req.params

  try {
    const [plots, count] = await selectPlotsByOwner(authUserId, +owner_id, req.query)
    res.status(200).send({ plots, count })
  } catch (err) {
    next(err)
  }
}


export const postPlotByOwner = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  const { owner_id } = req.params

  try {
    const plot = await insertPlotByOwner(authUserId, +owner_id, req.body)
    res.status(201).send({ plot })
  } catch (err) {
    next(err)
  }
}


export const getPinnedPlotsByOwner = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  const { owner_id } = req.params

  try {
    const plots = await selectPinnedPlotsByOwner(authUserId, +owner_id)
    res.status(200).send({ plots })
  } catch (err) {
    next(err)
  }
}


export const getPlotByPlotId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  const { plot_id } = req.params

  try {
    const plot = await selectPlotByPlotId(authUserId, +plot_id)
    res.status(200).send({ plot })
  } catch (err) {
    next(err)
  }
}


export const patchPlotByPlotId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  const { plot_id } = req.params

  try {
    const plot = await updatePlotByPlotId(authUserId, +plot_id, req.body)
    res.status(200).send({ plot })
  } catch (err) {
    next(err)
  }
}


export const deletePlotByPlotId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  const { plot_id } = req.params

  try {
    await removePlotByPlotId(authUserId, +plot_id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}


export const pinPlotByPlotId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  const { plot_id } = req.params

  try {
    const plot = await setIsPinnedByPlotId(authUserId, +plot_id, req.body)
    res.status(200).send({ plot })
  } catch (err) {
    next(err)
  }
}


export const unpinPlotByPlotId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  const { plot_id } = req.params

  try {
    const plot = await unsetIsPinnedByPlotId(authUserId, +plot_id, req.body)
    res.status(200).send({ plot })
  } catch (err) {
    next(err)
  }
}
