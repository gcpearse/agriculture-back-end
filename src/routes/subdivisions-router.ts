import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { getSubdivisionsByPlotId } from "../controllers/subdivision-controllers"


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
