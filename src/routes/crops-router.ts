import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { getCropByCropId, getCropsByPlotId, getCropsBySubdivisionId, patchCropByCropId, postCropByPlotId, postCropBySubdivisionId } from "../controllers/crops-controllers"


export const cropsRouter = Router()


cropsRouter.route("/crops/plot/:plot_id")


/**
 * @swagger
 * /api/crops/plot/{plot_id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve a plot's crops
 *    description: Responds with an array of crop objects. Results can be filtered by name or category and sorted by crop_id, name, date_planted, or harvest_date. If a parameter is invalid, the server responds with an error. Permission is denied when the plot does not belong to the user.
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
 *        name: category
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
 *                crops:
 *                  type: array
 *                  items:
 *                    allOf:
 *                      - $ref: "#/components/schemas/Crop"
 *                      - type: object
 *                        properties:
 *                          subdivision_name:
 *                            type: string
 *                            example: Vegetable Patch
 *                          note_count:
 *                            type: integer
 *                            example: 1
 *                          image_count:
 *                            type: integer
 *                            example: 1
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
 *    description: Responds with a crop object. If the request body or plot_id parameter is invalid, the server responds with an error. Permission is denied when the plot does not belong to the user.
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
 *            $ref: "#/components/schemas/CropRequest"
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
 *    description: Responds with an array of crop objects. Results can be filtered by name or category and sorted by crop_id, name, date_planted, or harvest_date. If a parameter is invalid, the server responds with an error. Permission is denied when the subdivision does not belong to the user.
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
 *        name: category
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
 *                crops:
 *                  type: array
 *                  items:
 *                    allOf:
 *                      - $ref: "#/components/schemas/Crop"
 *                      - type: object
 *                        properties:
 *                          note_count:
 *                            type: integer
 *                            example: 1
 *                          image_count:
 *                            type: integer
 *                            example: 1
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
 *    description: Responds with a crop object. If the request body or subdivision_id parameter is invalid, the server responds with an error. Permission is denied when the subdivision does not belong to the user.
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
 *            $ref: "#/components/schemas/CropRequest"
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


cropsRouter.route("/crops/:crop_id")


/**
 * @swagger
 * /api/crops/{crop_id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve a crop
 *    description: Responds with a crop object. If the crop_id parameter is invalid, the server responds with an error. Permission is denied when the crop does not belong to the user.
 *    tags: [Crops]
 *    parameters:
 *      - in: path
 *        name: crop_id
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
 *                crops:
 *                  type: array
 *                  items:
 *                    allOf:
 *                      - $ref: "#/components/schemas/Crop"
 *                      - type: object
 *                        properties:
 *                          plot_name:
 *                            type: string
 *                            example: John's Garden          
 *                          subdivision_name:
 *                            type: string
 *                            example: Vegetable Patch
 *                          note_count:
 *                            type: integer
 *                            example: 1
 *                          image_count:
 *                            type: integer
 *                            example: 1
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
  .get(verifyToken, getCropByCropId)


/**
 * @swagger
 * /api/crops/{crop_id}:
 *  patch:
 *    security:
 *      - bearerAuth: []
 *    summary: Update a crop
 *    description: Responds with an updated crop object. If the request body or crop_id parameter is invalid, the server responds with an error. Permission is denied when the crop does not belong to the user.
 *    tags: [Crops]
 *    parameters:
 *      - in: path
 *        name: crop_id
 *        required: true
 *        schema:
 *          type: integer
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: "#/components/schemas/CropRequest"
 *    responses:
 *      200:
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
  .patch(verifyToken, patchCropByCropId)
