import { NextFunction, Response } from "express";
import { ExtendedRequest } from "../types/auth-types";
import { insertIssueByPlotId, insertIssueBySubdivisionId, selectIssueByIssueId, selectIssuesByPlotId, selectIssuesBySubdivisionId } from "../models/issues-models";


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


export const postIssueByPlotId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  const { plot_id } = req.params

  try {
    const issue = await insertIssueByPlotId(authUserId, +plot_id, req.body)
    res.status(201).send({ issue })
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


export const postIssueBySubdivisionId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  const { subdivision_id } = req.params

  try {
    const issue = await insertIssueBySubdivisionId(authUserId, +subdivision_id, req.body)
    res.status(201).send({ issue })
  } catch (err) {
    next(err)
  }
}


export const getIssueByIssueId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  const { issue_id } = req.params

  try {
    const issue = await selectIssueByIssueId(authUserId, +issue_id)
    res.status(200).send({ issue })
  } catch (err) {
    next(err)
  }
}
