import { RequestHandler } from "express"
import { removeUserByUsername, selectUserByUsername } from "../models/user-models"


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
