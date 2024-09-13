import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { getIssuesByPlotId, getIssuesBySubdivisionId } from "../controllers/issues-controllers"


export const issuesRouter = Router()


issuesRouter.route("/issues/plots/:plot_id")


/**
 * @swagger
 * /api/issues/plots/{plot_id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve a plot's issues
 *    description: Responds with an array of issue objects. Results can be filtered by is_critical or is_resolved and sorted by issue_id or title. If a parameter is invalid, the server responds with an error. Permission is denied when the plot does not belong to the user.
 *    tags: [Issues]
 *    parameters:
 *      - in: path
 *        name: plot_id
 *        required: true
 *        schema:
 *          type: integer
 *      - in: query
 *        name: is_critical
 *        schema:
 *          type: boolean
 *      - in: query
 *        name: is_resolved
 *        schema:
 *          type: boolean
 *      - in: query
 *        name: sort
 *        schema:
 *          type: string
 *          enum:
 *            - issue_id
 *            - title
 *        default: issue_id
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
 *                issues:
 *                  type: array
 *                  items:
 *                    allOf:
 *                      - $ref: "#/components/schemas/Issue"
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
  .get(verifyToken, getIssuesByPlotId)


issuesRouter.route("/issues/subdivisions/:subdivision_id")


/**
 * @swagger
 * /api/issues/plots/{subdivision_id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve a subdivision's issues
 *    description: Responds with an array of issue objects. Results can be filtered by is_critical or is_resolved and sorted by issue_id or title. If a parameter is invalid, the server responds with an error. Permission is denied when the plot does not belong to the user.
 *    tags: [Issues]
 *    parameters:
 *      - in: path
 *        name: subdivision_id
 *        required: true
 *        schema:
 *          type: integer
 *      - in: query
 *        name: is_critical
 *        schema:
 *          type: boolean
 *      - in: query
 *        name: is_resolved
 *        schema:
 *          type: boolean
 *      - in: query
 *        name: sort
 *        schema:
 *          type: string
 *          enum:
 *            - issue_id
 *            - title
 *        default: issue_id
 *      - in: query
 *        name: order
 *        schema:
 *          type: string
 *          enum:
 *            - asc
 *            - desc
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                issues:
 *                  type: array
 *                  items:
 *                    allOf:
 *                      - $ref: "#/components/schemas/Issue"
 *                      - type: object
 *                        properties:
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
  .get(verifyToken, getIssuesBySubdivisionId)
