import { RequestHandler } from "express"


export const handleNotFound: RequestHandler = async (_req, res, next) => {

  try {
    res.status(404).send({ message: "Path not found" })
  } catch (err) {
    next(err)
  }
}
