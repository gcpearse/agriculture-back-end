import { Router } from "express"
import { postLogin } from "../controllers/auth-controllers"


export const loginRouter = Router()


loginRouter.post("/login", postLogin)
