import { ErrorRequestHandler } from "express"


export const handleCustomErrors: ErrorRequestHandler = (err, _req, res, next) => {

  if (err.status) {
    res.status(err.status).send({ message: err.message })
  } else {
    next(err)
  }
}


export const handleServerError: ErrorRequestHandler = (_err, _req, res, _next) => {

  res.status(500).send({ message: "Server error" })
}
