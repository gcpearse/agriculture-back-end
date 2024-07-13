import express from "express"
import { postLogin, postRegistration } from "./controllers/user-controllers"
import { handleCustomErrors, handleServerErrors } from "./middleware/errors"
import { handleNotFound } from "./controllers/handle-not-found"


export const app = express()


app.use(express.json())

app.post("/api/register", postRegistration)
app.post("/api/login", postLogin)

app.use(handleCustomErrors, handleServerErrors)

app.all("*", handleNotFound)
