import { NextFunction, Response } from "express"
import jwt from "jsonwebtoken"
import { LoggedInUser } from "../types/user-types"
import { ExtendedRequest } from "../types/auth-types"


export const generateToken = (user: LoggedInUser): string => {

  return jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: 3600 })
}


export const verifyToken = (req: ExtendedRequest, res: Response, next: NextFunction) => {

  const bearer = req.headers.authorization

  const token = bearer && bearer.split(" ")[1]

  if (!token) {
    return res.status(401).send({
      message: "Unauthorized",
      details: "Login required"
    })
  }

  jwt.verify(token!, process.env.JWT_SECRET!, (err: any, user: any) => {

    if (err) {
      return res.status(401).send({
        message: "Unauthorized",
        details: "Invalid or expired token"
      })
    }

    req.user = user

    next()
  })
}
