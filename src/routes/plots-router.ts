import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { getPlotsByOwner } from "../controllers/plot-controllers"


export const plotsRouter = Router()


/**
 * @swagger
 * /api/plots/{owner_id}:
 *  get:
 *    summary: Retrieve a user's plots
 *    description: Responds with a an array of plot objects. If no plots are found, the server responds with an error Permission is denied when the current user's ID does not match the target owner_id.
 *    tags: [Plots]
 *    parameters:
 *      - in: path
 *        name: owner_id
 *        required: true
 *        schema:
 *          type: integer
 *      - in: query
 *        name: type
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                plots:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      plot_id:
 *                        type: integer
 *                        example: 1
 *                      owner_id:
 *                        type: integer
 *                        example: 1
 *                      name:
 *                        type: string
 *                        example: John's Garden
 *                      type:
 *                        type: string
 *                        example: garden
 *                      description:
 *                        type: string
 *                        example: A vegetable garden
 *                      location:
 *                        type: integer
 *                        example: 1
 *                      area:
 *                        type: integer
 *                        example: 100
 */
plotsRouter.get("/plots/:owner_id", verifyToken, getPlotsByOwner)
