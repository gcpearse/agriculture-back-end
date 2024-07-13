import { RequestHandler } from "express"


export const testAuth: RequestHandler = async (_req, res, next) => {

  try {
    res.status(200).send({
      message: "Success"
    })
  } catch (err) {
    next(err)
  }
}
