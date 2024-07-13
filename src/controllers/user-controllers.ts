import { RequestHandler } from "express" 
import { registerUser, logInUser } from "../models/user-models"


export const postRegistration: RequestHandler = async (req, res, next) => {

  try {
    const user = await registerUser(req.body)
    res.status(201).send(user)
  } catch (err) {
    next(err)
  }
}


export const postLogin: RequestHandler = async (req, res, next) => {

  try {
    const username = await logInUser(req.body)
    res.status(200).send(username)
  } catch (err) {
    next(err)
  }
}
