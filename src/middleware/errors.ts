import { ErrorRequestHandler } from "express"

export const handleCustomErrors: ErrorRequestHandler = (err, _req, res, next) => {

  if (err.status) {
    res.status(err.status).send({ message: err.message })
  } else {
    next(err)
  }
}
