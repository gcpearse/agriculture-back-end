import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { getSubdivisionBySubdivisionId, getSubdivisionsByPlotId, postSubdivisionByPlotId } from "../controllers/subdivision-controllers"


export const subdivisionsRouter = Router()


/**
 * @swagger
 * components:
 *  schemas:
 *    Subdivision:
 *      type: object
 *      properties:
 *        subdivision_id:
 *          type: integer
 *          example: 1
 *        plot_id:
 *          type: integer
 *          example: 1
 *        name:
 *          type: string
 *          example: Root Vegetable Bed
 *        type:
 *          type: string
 *          example: bed
 *        description:
 *          type: string
 *          example: Carrots, beetroots, and parsnips
 *        area:
 *          type: integer
 *          example: 10
 */


subdivisionsRouter.route("/subdivisions/:plot_id")


/**
 * @swagger
 * /api/subdivisions/{plot_id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve subdivisions of a plot
 *    description: Responds with an array of subdivision objects. If the query parameter is invalid or the plot_id does not exist, the server responds with an error. Permission is denied when the plot does not belong to the current user.
 *    tags: [Subdivisions]
 *    parameters:
 *      - in: path
 *        name: plot_id
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
 *                $ref: "#/components/schemas/Subdivision"
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
 *                  example: "Permission to view plot subdivision data denied"
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
  .get(verifyToken, getSubdivisionsByPlotId)


/**
 * @swagger
 * /api/subdivisions/{plot_id}:
 *  post:
 *    security:
 *      - bearerAuth: []
 *    summary: Create a new subdivision of a plot
 *    description: Responds with a subdivision object. If the subdivision name already exists for the given plot, the server responds with an error. Permission is denied when the plot does not belong to the current user.
 *    tags: [Subdivisions]
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
 *              plot_id:
 *                type: integer
 *                example: 1
 *              name:
 *                type: string
 *                example: Root Vegetable Bed
 *              type:
 *                type: string
 *                example: bed
 *              description:
 *                type: string
 *                example: Carrots, beetroots, and parsnips
 *              area:
 *                type: integer
 *                example: 10
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Subdivision"
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
 *                  example: "Permission to create subdivision denied"
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
 *                  example: "Subdivision name already exists"
 */
  .post(verifyToken, postSubdivisionByPlotId)


subdivisionsRouter.route("/subdivisions/subdivision/:subdivision_id")


/**
 * @swagger
 * /api/subdivisions/subdivision/{subdivision_id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve a subdivision of a plot.
 *    description: Responds with a subdivision object. If no subdivision is found, the server responds with an error. Permission is denied when the subdivision does not belong to the current user.
 *    tags: [Subdivisions]
 *    parameters:
 *      - in: path
 *        name: subdivision_id
 *        required: true
 *        schema:
 *          type: integer
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Subdivision"
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
 *                  example: "Permission to view subdivision data denied"
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
 *                  example: "Subdivision not found"
 */
  .get(verifyToken, getSubdivisionBySubdivisionId)
