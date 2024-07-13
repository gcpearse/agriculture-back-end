import express from "express"
import swaggerJSDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import { handleCustomErrors, handleServerErrors } from "./middleware/errors"
import { handleNotFound } from "./controllers/handle-not-found"
import { usersRouter } from "./routes/users-router"
import { authRouter } from "./routes/auth-router"
import { loginRouter } from "./routes/login-router"
import { registerRouter } from "./routes/register-router"


export const app = express()


const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Agriculture API",
      description: "A full-stack application for gardeners, allotment owners, and other subsistence farmers to keep track of crops and jobs on their plots.",
      version: "1.0.0"
    }
  },
  apis: ["./dist/routes/*.js"]
}

const swaggerSpec = swaggerJSDoc(options)


app.use(express.json())


app.use("/api", registerRouter)

app.use("/api", loginRouter)

app.use("/api", authRouter)

app.use("/api", usersRouter)


app.use("/api", swaggerUi.serve, swaggerUi.setup(swaggerSpec))


app.use(handleCustomErrors, handleServerErrors)


app.all("*", handleNotFound)
