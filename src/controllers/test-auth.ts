import { RequestHandler } from "express"


export const testAuth: RequestHandler = async (_req, res, next) => {

  try {
    res.status(200).send({
      message: "OK",
      details: "Authentication successful"
    })
  } catch (err) {
    next(err)
  }
}
