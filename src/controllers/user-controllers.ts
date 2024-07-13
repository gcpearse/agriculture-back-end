import { RequestHandler } from "express"
import { registerUser, logInUser } from "../models/user-models"
import { generateToken } from "../middleware/authentication"


export const postRegistration: RequestHandler = async (req, res, next) => {

  try {
    const user = await registerUser(req.body)
    res.status(201).send({ user })
  } catch (err) {
    next(err)
  }
}


export const postLogin: RequestHandler = async (req, res, next) => {

  try {
    const username = await logInUser(req.body)
    const token = generateToken(username)
    res.status(200).send({ token })
  } catch (err) {
    next(err)
  }
}
