import { NextFunction, Response } from "express";
import { ExtendedRequest } from "../types/auth-types";
import { selectIssuesByPlotId, selectIssuesBySubdivisionId } from "../models/issues-models";


export const getIssuesByPlotId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  const { plot_id } = req.params

  try {
    const [issues, count] = await selectIssuesByPlotId(authUserId, +plot_id, req.query)
    res.status(200).send({ issues, count })
  } catch (err) {
    next(err)
  }
}


export const getIssuesBySubdivisionId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  const { subdivision_id } = req.params

  try {
    const [issues, count] = await selectIssuesBySubdivisionId(authUserId, +subdivision_id, req.query)
    res.status(200).send({ issues, count })
  } catch (err) {
    next(err)
  }
}
