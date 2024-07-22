import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { getCropsByPlotId, getCropsBySubdivisionId, postCropByPlotId, postCropBySubdivisionId } from "../controllers/crop-controllers"


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
 *              type: object
 *              properties:
 *                crops:
 *                  type: array
 *                  items:
 *                    $ref: "#/components/schemas/ExtendedCrop"
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
 *              name:
 *                type: string
 *                example: carrot
 *              variety:
 *                type: string
 *                nullable: true
 *                example: chantenay
 *              quantity:
 *                type: integer
 *                nullable: true
 *                example: 20
 *              date_planted:
 *                type: string
 *                nullable: true
 *                example: 2024-06-19
 *              harvest_date:
 *                type: string
 *                nullable: true
 *                example: 2024-09-14
 *    responses:
 *      201:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                crop:
 *                  $ref: "#/components/schemas/Crop"
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


cropsRouter.route("/crops/subdivision/:subdivision_id")


/**
 * @swagger
 * /api/crops/subdivision/{subdivision_id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve a subdivision's crops
 *    description: Responds with an array of crop objects. If a query parameter is invalid or the subdivision_id does not exist, the server responds with an error. Permission is denied when the subdivision does not belong to the current user.
 *    tags: [Crops]
 *    parameters:
 *      - in: path
 *        name: subdivision_id
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
 *              type: object
 *              properties:
 *                crops:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      crop_id:
 *                        type: integer
 *                        example: 1
 *                      plot_id:
 *                        type: integer
 *                        example: 1
 *                      subdivision_id:
 *                        type: integer
 *                        nullable: true
 *                        example: null
 *                      name:
 *                        type: string
 *                        example: carrot
 *                      variety:
 *                        type: string
 *                        nullable: true
 *                        example: chantenay
 *                      quantity:
 *                        type: integer
 *                        nullable: true
 *                        example: 20
 *                      date_planted:
 *                        type: string
 *                        nullable: true
 *                        example: 2024-06-19T23:00:00.000Z
 *                      harvest_date:
 *                        type: string
 *                        nullable: true
 *                        example: 2024-09-14T23:00:00.000Z
 *                      note_count:
 *                        type: integer
 *                        example: 1
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
  .get(verifyToken, getCropsBySubdivisionId)


/**
 * @swagger
 * /api/crops/subdivision/{subdivision_id}:
 *  post:
 *    security:
 *      - bearerAuth: []
 *    summary: Add a new crop to a subdivision
 *    description: Responds with a crop object. If the subdivision_id does not exist, the server responds with an error. Permission is denied when the subdivision does not belong to the current user.
 *    tags: [Crops]
 *    parameters:
 *      - in: path
 *        name: subdivision_id
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
 *                example: carrot
 *              variety:
 *                type: string
 *                nullable: true
 *                example: chantenay
 *              quantity:
 *                type: integer
 *                nullable: true
 *                example: 20
 *              date_planted:
 *                type: string
 *                nullable: true
 *                example: 2024-06-19
 *              harvest_date:
 *                type: string
 *                nullable: true
 *                example: 2024-09-14
 *    responses:
 *      201:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                crop:
 *                  $ref: "#/components/schemas/Crop"
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
  .post(verifyToken, postCropBySubdivisionId)
