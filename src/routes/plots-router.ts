import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { deletePlotByPlotId, getPlotByPlotId, getPlotsByOwner, patchPlotByPlotId, postPlotByOwner } from "../controllers/plot-controllers"


export const plotsRouter = Router()


/**
 * @swagger
 * components:
 *  schemas:
 *    Plot:
 *      type: object
 *      properties:
 *        plot_id:
 *          type: integer
 *          example: 1
 *        owner_id:
 *          type: integer
 *          example: 1
 *        name:
 *          type: string
 *          example: John's Garden
 *        type:
 *          type: string
 *          example: garden
 *        description:
 *          type: string
 *          example: A vegetable garden
 *        location:
 *          type: string
 *          example: Farmville
 *        area:
 *          type: integer
 *          example: 100
 */


plotsRouter.route("/plots/:owner_id")


/**
 * @swagger
 * /api/plots/{owner_id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve a user's plots
 *    description: Responds with an array of plot objects. If the query parameter is invalid or the owner_id does not exist, the server responds with an error. Permission is denied when the current user's ID does not match the target owner_id.
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
 *              type: array
 *              items:
 *                $ref: "#/components/schemas/Plot"
 *      400:
 *        description: Bad Request
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Bad Request"
 *                details:
 *                  type: string
 *                  example: "Invalid parameter"
 *      403:
 *        description: Forbidden
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Forbidden"
 *                details:
 *                  type: string
 *                  example: "Permission to view plot data denied"
 *      404:
 *        description: Not Found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Not Found"
 *                details:
 *                  type: string
 *                  example: "No results found for that query"
 */
  .get(verifyToken, getPlotsByOwner)


/**
 * @swagger
 * /api/plots/{owner_id}:
 *  post:
 *    security:
 *      - bearerAuth: []
 *    summary: Create a new plot
 *    description: Responds with a new plot object. If the plot name already exists for the current user or the owner_id does not exist, the server responds with an error. Permission is denied when the current user's ID does not match the target owner_id.
 *    tags: [Plots]
 *    parameters:
 *      - in: path
 *        name: owner_id
 *        required: true
 *        schema:
 *          type: integer
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              owner_id:
 *                type: integer
 *                example: 1
 *              name:
 *                type: string
 *                example: John's Garden
 *              type:
 *                type: string    
 *                example: garden
 *              description:
 *                type: string    
 *                example: A vegetable garden
 *              location:
 *                type: string    
 *                example: Farmville
 *              area:
 *                type: integer    
 *                example: 100
 *    responses:
 *      201:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Plot"
 *      400:
 *        description: Bad Request
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Bad Request"
 *                details:
 *                  type: string
 *                  example: "Invalid text representation"
 *      403:
 *        description: Forbidden
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Forbidden"
 *                details:
 *                  type: string
 *                  example: "Permission to create plot denied"
 *      404:
 *        description: Not Found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Not Found"
 *                details:
 *                  type: string
 *                  example: "User not found"
 *      409:
 *        description: Conflict
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Conflict"
 *                details:
 *                  type: string
 *                  example: "Plot name already exists"
 */
  .post(verifyToken, postPlotByOwner)


plotsRouter.route("/plots/plot/:plot_id")


/**
 * @swagger
 * /api/plots/plot/{plot_id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve a user's plot
 *    description: Responds with a plot object. If no plot is found, the server responds with an error. Permission is denied when the plot does not belong to the current user.
 *    tags: [Plots]
 *    parameters:
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
 *              $ref: "#/components/schemas/Plot"
 *      400:
 *        description: Bad Request
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Bad Request"
 *                details:
 *                  type: string
 *                  example: "Invalid parameter"
 *      403:
 *        description: Forbidden
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Forbidden"
 *                details:
 *                  type: string
 *                  example: "Permission to view plot data denied"
 *      404:
 *        description: Not Found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Not Found"
 *                details:
 *                  type: string
 *                  example: "Plot not found"
 */
  .get(verifyToken, getPlotByPlotId)


/**
 * @swagger
 * /api/plots/plot/{plot_id}:
 *  patch:
 *    security:
 *      - bearerAuth: []
 *    summary: Update a user's plot
 *    description: Responds with an updated plot object. If the plot name already exists for one of the current user's other plots or the plot_id does not exist, the server responds with an error. Permission is denied when the plot does not belong to the current user.
 *    tags: [Plots]
 *    parameters:
 *      - in: path
 *        name: plot_id
 *        required: true
 *        schema:
 *          type: integer
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                example: John's Garden
 *              type:
 *                type: string    
 *                example: garden
 *              description:
 *                type: string    
 *                example: A vegetable garden
 *              location:
 *                type: string    
 *                example: Farmville
 *              area:
 *                type: integer    
 *                example: 100
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Plot"
 *      400:
 *        description: Bad Request
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Bad Request"
 *                details:
 *                  type: string
 *                  example: "Invalid text representation"
 *      403:
 *        description: Forbidden
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Forbidden"
 *                details:
 *                  type: string
 *                  example: "Permission to edit plot data denied"
 *      404:
 *        description: Not Found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Not Found"
 *                details:
 *                  type: string
 *                  example: "Plot not found"
 *      409:
 *        description: Conflict
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Conflict"
 *                details:
 *                  type: string
 *                  example: "Plot name already exists"
 */
  .patch(verifyToken, patchPlotByPlotId)


/**
 * @swagger
 * /api/plots/plot/{plot_id}:
 *  delete:
 *    security:
 *      - bearerAuth: []
 *    summary: Delete a plot from the database
 *    description: Removes the plot and all associated data from the database. If the plot_id does not exist, the server responds with an error. Permission is denied when the plot does not belong to the current user.
 *    tags: [Plots]
 *    parameters:
 *      - in: path
 *        name: plot_id
 *        required: true
 *        schema:
 *          type: integer
 *    responses:
 *      204:
 *        description: No Content
 *      400:
 *        description: Bad Request
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Bad Request"
 *                details:
 *                  type: string
 *                  example: "Invalid parameter"
 *      403:
 *        description: Forbidden
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Forbidden"
 *                details:
 *                  type: string
 *                  example: "Permission to delete plot data denied"
 *      404:
 *        description: Not Found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Not Found"
 *                details:
 *                  type: string
 *                  example: "Plot not found"
 */
  .delete(verifyToken, deletePlotByPlotId)
