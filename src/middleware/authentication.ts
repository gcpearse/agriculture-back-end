import { RequestHandler } from "express"
import jwt from "jsonwebtoken"
import { LoggedInUser } from "../types/user-types"


export const generateToken = (user: LoggedInUser): string => {

  return jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: 3600 })
}


export const verifyToken: RequestHandler = (req, res, next) => {

  const bearer = req.headers.authorization

  const token = bearer && bearer.split(" ")[1]

  if (!token) {
    return res.status(401).send({
      message: "Unauthorised"
    })
  }

  jwt.verify(token!, process.env.JWT_SECRET!, (err: any, user: any) => {

    if (err) {
      return res.status(403).send({
        message: "Forbidden"
      })
    }

    req.body.user = user

    next()
  })
}
