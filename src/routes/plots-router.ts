import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { deletePlotByPlotId, getPlotByPlotId, getPlotsByOwner, patchPlotByPlotId, postPlotByOwner } from "../controllers/plot-controllers"


export const plotsRouter = Router()


plotsRouter.route("/plots/:owner_id")


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
 *    description: Responds with a plot object. If the plot name already exists for the current user, the server responds with an error. Permission is denied when the current user's ID does not match the target owner_id.
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
 *                example: John's Field
 *              type:
 *                type: string    
 *                example: field
 *              description:
 *                type: string    
 *                example: A large field
 *              location:
 *                type: string    
 *                example: Wildwood
 *              area:
 *                type: integer    
 *                example: 3000
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
 *                        example: 5
 *                      owner_id:
 *                        type: integer
 *                        example: 1
 *                      name:
 *                        type: string
 *                        example: John's Field
 *                      type:
 *                        type: string    
 *                        example: field
 *                      description:
 *                        type: string    
 *                        example: A large field
 *                      location:
 *                        type: string    
 *                        example: Wildwood
 *                      area:
 *                        type: integer    
 *                        example: 3000
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
 *    description: Responds with a plot object. If the plot name already exists for one of the current user's other plots, the server responds with an error. Permission is denied when the plot does not belong to the current user.
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
 *                example: John's Vegetable Patch
 *              type:
 *                type: string    
 *                example: vegetable patch
 *              description:
 *                type: string    
 *                example: A vegetable patch
 *              location:
 *                type: string    
 *                example: Appleby
 *              area:
 *                type: integer    
 *                example: 10
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
 *                        example: John's Vegetable Patch
 *                      type:
 *                        type: string    
 *                        example: vegetable patch
 *                      description:
 *                        type: string    
 *                        example: A vegetable patch
 *                      location:
 *                        type: string    
 *                        example: Appleby
 *                      area:
 *                        type: integer    
 *                        example: 10
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
 *    description: Removes the plot and all associated data from the database. Permission is denied when the plot does not belong to the current user.
 *    tags: [Plots]
 *    parameters:
 *      - in: path
 *        name: plot_id
 *        required: true
 *        schema:
 *          type: integer
 */
  .delete(verifyToken, deletePlotByPlotId)
