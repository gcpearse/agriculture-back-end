import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { deleteSubdivisionBySubdivisionId, getSubdivisionBySubdivisionId, getSubdivisionsByPlotId, patchSubdivisionBySubdivisionId, postSubdivisionByPlotId } from "../controllers/subdivision-controllers"


export const subdivisionsRouter = Router()


subdivisionsRouter.route("/subdivisions/plot/:plot_id")


/**
 * @swagger
 * /api/subdivisions/plot/{plot_id}:
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
 *              type: object
 *              properties:
 *                subdivisions:
 *                  type: array
 *                  items:
 *                    $ref: "#/components/schemas/Subdivision"
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
  .get(verifyToken, getSubdivisionsByPlotId)


/**
 * @swagger
 * /api/subdivisions/plot/{plot_id}:
 *  post:
 *    security:
 *      - bearerAuth: []
 *    summary: Create a new subdivision of a plot
 *    description: Responds with a new subdivision object. If the subdivision name already exists for the given plot or the plot_id does not exist, the server responds with an error. Permission is denied when the plot does not belong to the current user.
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
 *                nullable: true
 *                example: 10
 *    responses:
 *      201:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                subdivision:
 *                  $ref: "#/components/schemas/Subdivision"
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
  .post(verifyToken, postSubdivisionByPlotId)


subdivisionsRouter.route("/subdivisions/:subdivision_id")


/**
 * @swagger
 * /api/subdivisions/{subdivision_id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve a subdivision
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
 *              type: object
 *              properties:
 *                subdivision:
 *                  $ref: "#/components/schemas/Subdivision"
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
  .get(verifyToken, getSubdivisionBySubdivisionId)


/**
 * @swagger
 * /api/subdivisions/{subdivision_id}:
 *  patch:
 *    security:
 *      - bearerAuth: []
 *    summary: Update a subdivision
 *    description: Responds with an updated subdivision object. If the subdivision name already exists for another subdivision of a plot or the subdivision_id does not exist, the server responds with an error. Permission is denied when the subdivision does not belong to the current user.
 *    tags: [Subdivisions]
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
 *                example: Root Vegetable Bed
 *              type:
 *                type: string
 *                example: bed
 *              description:
 *                type: string
 *                example: Carrots, beetroots, and parsnips
 *              area:
 *                type: integer
 *                nullable: true
 *                example: 10
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                subdivision:
 *                  $ref: "#/components/schemas/Subdivision"
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
  .patch(verifyToken, patchSubdivisionBySubdivisionId)


/**
 * @swagger
 * /api/subdivisions/{subdivision_id}:
 *  delete:
 *    security:
 *      - bearerAuth: []
 *    summary: Delete a subdivision from the database
 *    description: Removes the plot subdivision and all associated data from the database. If the subdivision_id does not exist, the server responds with an error Permission is denied when the subdivision does not belong to the current user.
 *    tags: [Subdivisions]
 *    parameters:
 *      - in: path
 *        name: subdivision_id
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
  .delete(verifyToken, deleteSubdivisionBySubdivisionId)
