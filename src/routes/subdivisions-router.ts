import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { deleteSubdivisionBySubdivisionId, getSubdivisionBySubdivisionId, getSubdivisionsByPlotId, patchSubdivisionBySubdivisionId, postSubdivisionByPlotId } from "../controllers/subdivisions-controllers"


export const subdivisionsRouter = Router()


subdivisionsRouter.route("/subdivisions/plots/:plot_id")


/**
 * @swagger
 * /api/subdivisions/plots/{plot_id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve subdivisions of a plot
 *    description: Responds with an array of subdivision objects. Results can be filtered by name or type and sorted by subdivision_id, name, or type. If a parameter is invalid, the server responds with an error. Permission is denied when the plot does not belong to the user.
 *    tags: [Subdivisions]
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
 *        name: type
 *        schema:
 *          type: string
 *      - in: query
 *        name: sort
 *        schema:
 *          type: string
 *          enum:
 *            - subdivision_id
 *            - name
 *            - type
 *        default: type
 *      - in: query
 *        name: order
 *        schema:
 *          type: string
 *          enum:
 *            - asc
 *            - desc
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
 *                subdivisions:
 *                  type: array
 *                  items:
 *                    allOf:
 *                      - $ref: "#/components/schemas/Subdivision"
 *                      - type: object
 *                        properties:
 *                          image_count:
 *                            type: integer
 *                            example: 1
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
  .get(verifyToken, getSubdivisionsByPlotId)


/**
 * @swagger
 * /api/subdivisions/plots/{plot_id}:
 *  post:
 *    security:
 *      - bearerAuth: []
 *    summary: Create a new subdivision of a plot
 *    description: Responds with a new subdivision object. If the request body or plot_id parameter is invalid or the subdivision name would be a duplicate, the server responds with an error. Permission is denied when the plot does not belong to the user.
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
 *            $ref: "#/components/schemas/SubdivisionRequest"
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
 *    description: Responds with a subdivision object. If the subdivision_id parameter is invalid, the server responds with an error. Permission is denied when the subdivision does not belong to the user.
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
 *                  allOf:
 *                    - $ref: "#/components/schemas/Subdivision"
 *                    - type: object
 *                      properties:
 *                        plot_name:
 *                          type: string
 *                          example: "John's Garden"
 *                        image_count:
 *                          type: integer
 *                          example: 1
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
  .get(verifyToken, getSubdivisionBySubdivisionId)


/**
 * @swagger
 * /api/subdivisions/{subdivision_id}:
 *  patch:
 *    security:
 *      - bearerAuth: []
 *    summary: Update a subdivision
 *    description: Responds with an updated subdivision object. If the request body or subdivision_id parameter is invalid or the subdivision name would be a duplicate, the server responds with an error. Permission is denied when the subdivision does not belong to the user.
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
 *            $ref: "#/components/schemas/SubdivisionRequest"
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
 *    description: Removes the subdivision and all associated data from the database. If the subdivision_id parameter is invalid, the server responds with an error. Permission is denied when the subdivision does not belong to the user.
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
