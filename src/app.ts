import express from "express"
import { postLogin, postRegistration } from "./controllers/user-controllers"
import { handleCustomErrors, handleServerErrors } from "./middleware/errors"
import { handleNotFound } from "./controllers/handle-not-found"
import { verifyToken } from "./middleware/authentication"
import { testAuth } from "./controllers/test-auth"


export const app = express()


app.use(express.json())

app.post("/api/register", postRegistration)
app.post("/api/login", postLogin)
app.get("/api/auth", verifyToken, testAuth)

app.use(handleCustomErrors, handleServerErrors)

app.all("*", handleNotFound)
