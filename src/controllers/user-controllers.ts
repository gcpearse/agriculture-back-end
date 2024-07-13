import { RequestHandler } from "express" 
import { insertUser, logInUser } from "../models/user-models"


export const postUser: RequestHandler = async (req, res, next) => {

  try {
    const user = await insertUser(req.body)
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
