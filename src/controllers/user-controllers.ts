import { RequestHandler } from "express" 
import { insertUser } from "../models/user-models"


export const postUser: RequestHandler = async (req, res, next) => {

  try {
    const user = await insertUser(req.body)
    res.status(201).send(user)
  } catch (err) {
    next(err)
  }
}
