import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { deleteUserByUsername, getUserByUsername } from "../controllers/user-controllers"


export const usersRouter = Router()

usersRouter.route("/:username")
  .get(verifyToken, getUserByUsername)
  .delete(verifyToken, deleteUserByUsername)
