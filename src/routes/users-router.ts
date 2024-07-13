import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { deleteUserByUsername, getUserByUsername, patchUserByUsername } from "../controllers/user-controllers"


export const usersRouter = Router()

usersRouter.route("/:username")
  .get(verifyToken, getUserByUsername)
  .patch(verifyToken, patchUserByUsername)
  .delete(verifyToken, deleteUserByUsername)
