import { NextFunction, Response } from "express";
import { ExtendedRequest } from "../types/auth-types";
import { selectIssuesByPlotId } from "../models/issues-models";


export const getIssuesByPlotId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  const { plot_id } = req.params

  try {
    const issues = await selectIssuesByPlotId(authUserId, +plot_id, req.query)
    res.status(200).send({ issues })
  } catch (err) {
    next(err)
  }
}
