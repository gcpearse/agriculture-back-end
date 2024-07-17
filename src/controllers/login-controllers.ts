import { RequestHandler } from "express"
import { logInUser } from "../models/login-models"
import { generateToken } from "../middleware/authentication"


export const postLogin: RequestHandler = async (req, res, next) => {

  try {
    const user = await logInUser(req.body)
    const token = generateToken(user)
    res.status(200).send({ token })
  } catch (err) {
    next(err)
  }
}
