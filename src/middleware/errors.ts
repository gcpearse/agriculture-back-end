import { ErrorRequestHandler } from "express"


export const handleCustomErrors: ErrorRequestHandler = (err, _req, res, next) => {

  if (err.status) {
    res.status(err.status).send({ 
      message: err.message,
      details: err.details
    })
  } else {
    next(err)
  }
}


export const handlePsqlErrors: ErrorRequestHandler = (err, _req, res, next) => {

  if (err.code === "22P02") {
    res.status(400).send({ message: "Bad request" })
  } else {
    next(err)
  }
}


export const handleServerErrors: ErrorRequestHandler = (err, _req, res, _next) => {

  console.log(err.code)
  res.status(500).send({ message: "Server error" })
}
