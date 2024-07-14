import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { getPlotByPlotId, getPlotsByOwner } from "../controllers/plot-controllers"


export const plotsRouter = Router()


/**
 * @swagger
 * /api/plots/{owner_id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve a user's plots
 *    description: Responds with an array of plot objects. If no plots are found, the server responds with an error. Permission is denied when the current user's ID does not match the target owner_id.
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
 *      403:
 *        description: Forbidden
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Access to plot data denied"
 *      404:
 *        description: Not Found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "No results found"
 */
plotsRouter.get("/plots/:owner_id", verifyToken, getPlotsByOwner)

/**
 * @swagger
 * /api/plots/{owner_id}/{plot_id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve a user's plot
 *    description: Responds with a single plot object. If no plot is found, the server responds with an error. Permission is denied when the current user's ID does not match the target owner_id.
 *    tags: [Plots]
 *    parameters:
 *      - in: path
 *        name: owner_id
 *        required: true
 *        schema:
 *          type: integer
 *      - in: path
 *        name: plot_id
 *        required: true
 *        schema:
 *          type: integer
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                plot_id:
 *                  type: integer
 *                  example: 1
 *                owner_id:
 *                  type: integer
 *                  example: 1
 *                name:
 *                  type: string
 *                  example: John's Garden
 *                type:
 *                  type: string
 *                  example: garden
 *                description:
 *                  type: string
 *                  example: A vegetable garden
 *                location:
 *                  type: integer
 *                  example: 1
 *                area:
 *                  type: integer
 *                  example: 100
 *      403:
 *        description: Forbidden
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Access to plot data denied"
 */
plotsRouter.get("/plots/:owner_id/:plot_id", verifyToken, getPlotByPlotId)
