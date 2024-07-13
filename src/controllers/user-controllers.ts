import { RequestHandler } from "express"
import { changedPasswordByUsername, removeUserByUsername, selectUserByUsername, updateUserByUsername } from "../models/user-models"


export const getUserByUsername: RequestHandler = async (req, res, next) => {

  const authorisedUser = req.body.user.username

  const { username } = req.params

  try {
    const user = await selectUserByUsername(authorisedUser, username)
    res.status(200).send({ user })
  } catch (err) {
    next(err)
  }
}


export const patchUserByUsername: RequestHandler = async (req, res, next) => {

  const authorisedUser = req.body.user.username

  const { username } = req.params

  try {
    const user = await updateUserByUsername(authorisedUser, username, req.body)
    res.status(200).send({ user })
  } catch (err) {
    next(err)
  }
}


export const patchPasswordByUsername: RequestHandler = async (req, res, next) => {

  const authorisedUser = req.body.user.username

  const { username } = req.params

  const { password } = req.body

  try {
    const user = await changedPasswordByUsername(authorisedUser, username, password)
    res.status(200).send({ user })
  } catch (err) {
    next(err)
  }
}


export const deleteUserByUsername: RequestHandler = async (req, res, next) => {

  const authorisedUser = req.body.user.username

  const { username } = req.params

  try {
    await removeUserByUsername(authorisedUser, username)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
