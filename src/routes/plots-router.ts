import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { deletePlotByPlotId, getPinnedPlotsByOwner, getPlotByPlotId, getPlotsByOwner, patchIsPinnedByPlotId, patchPlotByPlotId, postPlotByOwner } from "../controllers/plots-controllers"


export const plotsRouter = Router()


plotsRouter.route("/plots/user/:owner_id")


/**
 * @swagger
 * /api/plots/user/{owner_id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve a user's plots
 *    description: Responds with an array of plot objects. Results can be filtered by name and sorted by plot_id or name. If a parameter is invalid, the server responds with an error. Permission is denied when the user's user ID does not match the owner_id parameter.
 *    tags: [Plots]
 *    parameters:
 *      - in: path
 *        name: owner_id
 *        required: true
 *        schema:
 *          type: integer
 *      - in: query
 *        name: name
 *        schema:
 *          type: string
 *      - in: query
 *        name: type
 *        schema:
 *          type: string
 *      - in: query
 *        name: sort
 *        schema:
 *          type: string
 *        default: plot_id
 *      - in: query
 *        name: order
 *        schema:
 *          type: string
 *        default: desc
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        default: 10
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *        default: 1
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
 *                    allOf:
 *                      - $ref: "#/components/schemas/Plot"
 *                      - type: object
 *                        properties:
 *                          image_count:
 *                            type: integer
 *                            example: 1
 *                          subdivision_count:
 *                            type: integer
 *                            example: 2
 *                          crop_count:
 *                            type: integer
 *                            example: 5
 *                          issue_count:
 *                            type: integer
 *                            example: 3
 *                          job_count:
 *                            type: integer
 *                            example: 0
 *                count:
 *                  type: integer
 *                  example: 1
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
 *    description: Responds with a new plot object. If the request body or owner_id parameter is invalid or the plot name would be a duplicate, the server responds with an error. Permission is denied when the user's user ID does not match the owner_id parameter.
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


plotsRouter.route("/plots/user/:owner_id/pinned")


/**
 * @swagger
 * /api/plots/user/{owner_id}/pinned:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve a user's pinned plots
 *    description: Responds with an array of plot objects. Results are sorted by name. If the owner_id parameter is invalid, the server responds with an error. Permission is denied when the user's user ID does not match the owner_id parameter.
 *    tags: [Plots]
 *    parameters:
 *      - in: path
 *        name: owner_id
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
  .get(verifyToken, getPinnedPlotsByOwner)


plotsRouter.route("/plots/:plot_id")


/**
 * @swagger
 * /api/plots/{plot_id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve a plot
 *    description: Responds with a plot object. If the plot_id parameter is invalid, the server responds with an error. Permission is denied when the plot does not belong to the user.
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
 *                  allOf:
 *                    - $ref: "#/components/schemas/Plot"
 *                    - type: object
 *                      properties:
 *                        image_count:
 *                          type: integer
 *                          example: 1
 *                        subdivision_count:
 *                          type: integer
 *                          example: 2
 *                        crop_count:
 *                          type: integer
 *                          example: 5
 *                        issue_count:
 *                          type: integer
 *                          example: 3
 *                        job_count:
 *                          type: integer
 *                          example: 0
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
 *    description: Responds with an updated plot object. If the request body or plot_id parameter is invalid or the plot name would be a duplicate, the server responds with an error. Permission is denied when the plot does not belong to the user.
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
 *    description: Removes the plot and all associated data from the database. If the plot_id parameter is invalid, the server responds with an error. Permission is denied when the plot does not belong to the user.
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


plotsRouter.route("/plots/:plot_id/pin")


/**
 * @swagger
 * /api/plots/{plot_id}/pin:
 *  patch:
 *    security:
 *      - bearerAuth: []
 *    summary: Pin or unpin a plot
 *    description: Responds with a success message. If the maximum number of plots are already pinned or the plot_id parameter is invalid, the server responds with an error. Permission is denied when the plot does not belong to the user.
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
 *              bool:
 *                type: boolean
 *                example: true
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                details:
 *                  type: string
 *            examples:
 *              Plot pinned:
 *                value:
 *                  message: OK
 *                  details: Plot pinned successfully
 *              Plot unpinned:
 *                value:
 *                  message: OK
 *                  details: Plot unpinned successfully
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
  .patch(verifyToken, patchIsPinnedByPlotId)
