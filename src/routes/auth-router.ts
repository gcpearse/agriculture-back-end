import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { testAuth } from "../controllers/test-auth"


export const authRouter = Router()


authRouter.get("/auth", verifyToken, testAuth)
