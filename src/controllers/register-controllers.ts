import { RequestHandler } from "express"
import { registerUser } from "../models/register-models"


export const postRegistration: RequestHandler = async (req, res, next) => {

  try {
    const user = await registerUser(req.body)
    res.status(201).send({ user })
  } catch (err) {
    next(err)
  }
}
