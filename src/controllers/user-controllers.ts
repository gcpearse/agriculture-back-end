import { RequestHandler } from "express"
import { selectUserByUsername } from "../models/user-models"


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
