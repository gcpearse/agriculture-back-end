import { NextFunction, Response } from "express"
import { selectAllUsers, selectUserByUserId, updateUserByUserId, removeUserByUserId, updatePasswordByUserId } from "../models/users-models"
import { ExtendedRequest } from "../types/auth-types"


export const getUsers = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  try {
    const [users, count] = await selectAllUsers(authUserId, req.query)
    res.status(200).send({ users, count })
  } catch (err) {
    next(err)
  }
}


export const getUserByUserId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  const { user_id } = req.params

  try {
    const user = await selectUserByUserId(authUserId, +user_id)
    res.status(200).send({ user })
  } catch (err) {
    next(err)
  }
}


export const patchUserByUserId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  const { user_id } = req.params

  try {
    const user = await updateUserByUserId(authUserId, +user_id, req.body)
    res.status(200).send({ user })
  } catch (err) {
    next(err)
  }
}


export const deleteUserByUserId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  const { user_id } = req.params

  try {
    await removeUserByUserId(authUserId, +user_id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}


export const patchPasswordByUserId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUserId = req.user!.user_id

  const { user_id } = req.params

  try {
    const response = await updatePasswordByUserId(authUserId, +user_id, req.body)
    res.status(200).send(response)
  } catch (err) {
    next(err)
  }
}
