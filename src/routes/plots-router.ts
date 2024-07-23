import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { deletePlotByPlotId, getPlotByPlotId, getPlotsByOwner, patchPlotByPlotId, postPlotByOwner } from "../controllers/plots-controllers"


export const plotsRouter = Router()


plotsRouter.route("/plots/user/:owner_id")


/**
 * @swagger
 * /api/plots/user/{owner_id}:
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
 *              type: object
 *              properties:
 *                plots:
 *                  type: array
 *                  items:
 *                    $ref: "#/components/schemas/Plot"
 *      400:
 *        description: Bad Request
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/BadRequest"
 *      403:
 *        description: Forbidden
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Forbidden"
 *      404:
 *        description: Not Found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/NotFound"
 */
  .get(verifyToken, getPlotsByOwner)


/**
 * @swagger
 * /api/plots/user/{owner_id}:
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
 *            $ref: "#/components/schemas/PlotRequest"
 *    responses:
 *      201:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                plot:
 *                  $ref: "#/components/schemas/Plot"
 *      400:
 *        description: Bad Request
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/BadRequest"
 *      403:
 *        description: Forbidden
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Forbidden"
 *      404:
 *        description: Not Found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/NotFound"
 *      409:
 *        description: Conflict
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Conflict"
 */
  .post(verifyToken, postPlotByOwner)


plotsRouter.route("/plots/:plot_id")


/**
 * @swagger
 * /api/plots/{plot_id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve a plot
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
 *              type: object
 *              properties:
 *                plot:
 *                  $ref: "#/components/schemas/Plot"
 *      400:
 *        description: Bad Request
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/BadRequest"
 *      403:
 *        description: Forbidden
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Forbidden"
 *      404:
 *        description: Not Found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/NotFound"
 */
  .get(verifyToken, getPlotByPlotId)


/**
 * @swagger
 * /api/plots/{plot_id}:
 *  patch:
 *    security:
 *      - bearerAuth: []
 *    summary: Update a plot
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
 *            $ref: "#/components/schemas/PlotRequest"
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                plot:
 *                  $ref: "#/components/schemas/Plot"
 *      400:
 *        description: Bad Request
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/BadRequest"
 *      403:
 *        description: Forbidden
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Forbidden"
 *      404:
 *        description: Not Found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/NotFound"
 *      409:
 *        description: Conflict
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Conflict"
 */
  .patch(verifyToken, patchPlotByPlotId)


/**
 * @swagger
 * /api/plots/{plot_id}:
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
 *              $ref: "#/components/schemas/BadRequest"
 *      403:
 *        description: Forbidden
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Forbidden"
 *      404:
 *        description: Not Found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/NotFound"
 */
  .delete(verifyToken, deletePlotByPlotId)
