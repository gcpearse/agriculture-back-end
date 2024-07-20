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
 *    description: Responds with an array of crop objects.
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