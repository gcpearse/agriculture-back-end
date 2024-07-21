import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { getCropsByPlotId, postCropByPlotId } from "../controllers/crop-controllers"


export const cropsRouter = Router()


cropsRouter.route("/crops/plot/:plot_id")


/**
 * @swagger
 * /api/crops/plot/{plot_id}:
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
 *                $ref: "#/components/schemas/Crop"
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


/**
 * @swagger
 * /api/crops/plot/{plot_id}:
 *  post:
 *    security:
 *      - bearerAuth: []
 *    summary: Add a new crop to a plot
 *    description: Responds with a crop object. If the plot_id does not exist, the server responds with an error. Permission is denied when the plot does not belong to the current user.
 *    tags: [Crops]
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
 *              subdivision_id:
 *                type: integer
 *                nullable: true
 *                example: null
 *              name:
 *                type: string
 *                example: Root Vegetable Bed
 *              variety:
 *                type: string
 *                nullable: true
 *                example: bed
 *              quantity:
 *                type: integer
 *                nullable: true
 *                example: 1
 *              date_planted:
 *                type: string
 *                nullable: true
 *                example: 2024-07-21
 *              harvest_date:
 *                type: string
 *                nullable: true
 *                example: 2024-09-30
 *    responses:
 *      201:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Crop"
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
  .post(verifyToken, postCropByPlotId)
