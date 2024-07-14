import { RequestHandler } from "express"
import { changePasswordByUsername, removeUserByUsername, selectUserByUsername, updateUserByUsername } from "../models/user-models"
import { Password } from "../types/user-types"


export const getUserByUsername: RequestHandler = async (req, res, next) => {

  const authUsername: string = req.body.user.username

  const { username } = req.params

  try {
    const user = await selectUserByUsername(authUsername, username)
    res.status(200).send({ user })
  } catch (err) {
    next(err)
  }
}


export const patchUserByUsername: RequestHandler = async (req, res, next) => {

  const authUsername: string = req.body.user.username

  const { username } = req.params

  try {
    const user = await updateUserByUsername(authUsername, username, req.body)
    res.status(200).send({ user })
  } catch (err) {
    next(err)
  }
}


export const patchPasswordByUsername: RequestHandler = async (req, res, next) => {

  const authUsername: string = req.body.user.username

  const { username } = req.params

  const { password }: Password = req.body

  try {
    const user = await changePasswordByUsername(authUsername, username, password)
    res.status(200).send({ user })
  } catch (err) {
    next(err)
  }
}


export const deleteUserByUsername: RequestHandler = async (req, res, next) => {

  const authUsername = req.body.user.username

  const { username } = req.params

  try {
    await removeUserByUsername(authUsername, username)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
