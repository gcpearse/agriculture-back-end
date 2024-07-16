import express from "express"
import cors from "cors"
import swaggerJSDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import { options } from "./swagger/options"

import { handleCustomErrors, handlePsqlErrors, handleServerErrors } from "./middleware/errors"
import { handleNotFound } from "./controllers/handle-not-found"

import { registerRouter } from "./routes/register-router"
import { loginRouter } from "./routes/login-router"
import { authRouter } from "./routes/auth-router"
import { usersRouter } from "./routes/users-router"
import { plotsRouter } from "./routes/plots-router"


export const app = express()


app.use(cors())


const swaggerSpec = swaggerJSDoc(options)


app.use(express.json())


app.use("/api", registerRouter)

app.use("/api", loginRouter)

app.use("/api", authRouter)

app.use("/api", usersRouter)

app.use("/api", plotsRouter)


app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))


app.use(handleCustomErrors, handlePsqlErrors, handleServerErrors)


app.all("*", handleNotFound)
