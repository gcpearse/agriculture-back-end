import { Router } from "express"
import { postRegistration } from "../controllers/auth-controllers"


export const registerRouter = Router()


registerRouter.post("/register", postRegistration)
