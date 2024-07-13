export const handleCustomErrors = (err: any, _req: any, res: any, next: any) => {

  if (err.status) {
    res.status(err.status).send({ message: err.message })
  } else {
    next(err)
  }
}
