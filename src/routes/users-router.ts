import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { deleteUserByUsername, getUserByUsername, patchPasswordByUsername, patchUserByUsername } from "../controllers/user-controllers"


export const usersRouter = Router()

usersRouter.route("/:username")
  .get(verifyToken, getUserByUsername)
  .patch(verifyToken, patchUserByUsername)
  .delete(verifyToken, deleteUserByUsername)

usersRouter.patch("/:username/password", verifyToken, patchPasswordByUsername)
