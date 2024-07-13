import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { getUserByUsername } from "../controllers/user-controllers"


export const usersRouter = Router()

usersRouter.get("/:username", verifyToken, getUserByUsername)
