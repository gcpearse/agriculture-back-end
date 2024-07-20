import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { getCropsByPlotId } from "../controllers/crop-controllers"


export const cropsRouter = Router()


cropsRouter.route("/crops/:plot_id")


/**
 * @swagger
 * /api/crops/{plot_id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve a plot's crops
 *    description: Responds with an array of crop objects. If a query parameter is invalid or the plot_id does not exist, the server responds with an error. Permission is denied when the plot does not belong to the current user.
 *    tags: [Crops]
 *    parameters:
 *      - in: path
 *        name: plot_id
 *        required: true
 *        schema:
 *          type: integer
 *      - in: query
 *        name: name
 *        schema:
 *          type: string
 *      - in: query
 *        name: sort
 *        schema:
 *          type: string
 *        default: crop_id
 *      - in: query
 *        name: order
 *        schema:
 *          type: string
 *        default: asc
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
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  crop_id:
 *                    type: integer
 *                    example: 1
 *                  plot_id:
 *                    type: integer
 *                    example: 1
 *                  subdivision_id:
 *                    type: integer
 *                    example: 1
 *                  name:
 *                    type: string
 *                    example: carrot
 *                  variety:
 *                    type: string
 *                    example: chantenay
 *                  quantity:
 *                    type: integer
 *                    example: 20
 *                  date_planted:
 *                    type: string
 *                    example: 2024-06-19T23:00:00.000Z
 *                  harvest_date:
 *                    type: string
 *                    example: 2024-09-14T23:00:00.000Z
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
  .get(verifyToken, getCropsByPlotId)
