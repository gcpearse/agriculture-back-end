import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { getSubdivisionsByPlotId } from "../controllers/subdivision-controllers"


export const subdivisionsRouter = Router()


subdivisionsRouter.route("/subdivisions/:plot_id")


/**
 * @swagger
 * /api/subdivisions/{plot_id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve subdivisions of a plot
 *    description: Responds with an array of subdivision objects.
 *    tags: [Subdivisions]
 */
  .get(verifyToken, getSubdivisionsByPlotId)
