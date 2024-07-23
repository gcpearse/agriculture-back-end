import { NextFunction, Response } from "express"
import { changePasswordByUsername, removeUserByUsername, selectUserByUsername, updateUserByUsername } from "../models/users-models"
import { ExtendedRequest } from "../types/auth-types"


export const getUserByUsername = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUsername = req.user!.username

  const { username } = req.params

  try {
    const user = await selectUserByUsername(authUsername, username)
    res.status(200).send({ user })
  } catch (err) {
    next(err)
  }
}


export const patchUserByUsername = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUsername = req.user!.username

  const { username } = req.params

  try {
    const user = await updateUserByUsername(authUsername, username, req.body)
    res.status(200).send({ user })
  } catch (err) {
    next(err)
  }
}


export const deleteUserByUsername = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUsername = req.user!.username

  const { username } = req.params

  try {
    await removeUserByUsername(authUsername, username)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}


export const patchPasswordByUsername = async (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const authUsername = req.user!.username

  const { username } = req.params

  try {
    const response = await changePasswordByUsername(authUsername, username, req.body)
    res.status(200).send(response)
  } catch (err) {
    next(err)
  }
}
