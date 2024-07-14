import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { getPlotsByOwner } from "../controllers/plot-controllers"


export const plotsRouter = Router()


plotsRouter.get("/plots/:owner_id", verifyToken, getPlotsByOwner)
