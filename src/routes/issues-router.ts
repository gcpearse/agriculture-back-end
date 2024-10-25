import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { deleteIssueByIssueId, getIssueByIssueId, getIssuesByPlotId, getIssuesBySubdivisionId, patchIssueByIssueId, postIssueByPlotId, postIssueBySubdivisionId, resolveIssueByIssueId, unresolveIssueByIssueId } from "../controllers/issues-controllers"


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
  .get(verifyToken, getIssuesByPlotId)

/**
 * @swagger
 * /api/issues/plots/{plot_id}:
 *  post:
 *    security:
 *      - bearerAuth: []
 *    summary: Add a new issue to a plot
 *    description: Responds with an issue object. If the request body or plot_id parameter is invalid, the server responds with an error. Permission is denied when the plot does not belong to the user.
 *    tags: [Issues]
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
 *            $ref: "#/components/schemas/IssueRequest"
 *    responses:
 *      201:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                issue:
 *                  $ref: "#/components/schemas/Issue"
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
  .post(verifyToken, postIssueByPlotId)


issuesRouter.route("/issues/subdivisions/:subdivision_id")


/**
 * @swagger
 * /api/issues/subdivisions/{subdivision_id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve a subdivision's issues
 *    description: Responds with an array of issue objects. Results can be filtered by is_critical or is_resolved and sorted by issue_id or title. If a parameter is invalid, the server responds with an error. Permission is denied when the subdivision does not belong to the user.
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
  .get(verifyToken, getIssuesBySubdivisionId)

/**
 * @swagger
 * /api/issues/subdivisions/{subdivision_id}:
 *  post:
 *    security:
 *      - bearerAuth: []
 *    summary: Add a new issue to a subdivision
 *    description: Responds with an issue object. If the request body or subdivision_id parameter is invalid, the server responds with an error. Permission is denied when the subdivision does not belong to the user.
 *    tags: [Issues]
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
 *            $ref: "#/components/schemas/IssueRequest"
 *    responses:
 *      201:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                issue:
 *                  $ref: "#/components/schemas/Issue"
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
  .post(verifyToken, postIssueBySubdivisionId)


issuesRouter.route("/issues/:issue_id")


/**
 * @swagger
 * /api/issues/{issue_id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve an issue
 *    description: Responds with an issue object. If the issue_id parameter is invalid, the server responds with an error. Permission is denied when the issue does not belong to the user.
 *    tags: [Issues]
 *    parameters:
 *      - in: path
 *        name: issue_id
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
 *                issue:
 *                  allOf:
 *                    - $ref: "#/components/schemas/Issue"
 *                    - type: object
 *                      properties:
 *                        plot_name:
 *                          type: string
 *                          example: John's Garden          
 *                        subdivision_name:
 *                          type: string
 *                          example: Vegetable Patch
 *                        note_count:
 *                          type: integer
 *                          example: 1
 *                        image_count:
 *                          type: integer
 *                          example: 1
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
  .get(verifyToken, getIssueByIssueId)


/**
 * @swagger
 * /api/issues/{issue_id}:
 *  patch:
 *    security:
 *      - bearerAuth: []
 *    summary: Update an issue
 *    description: Responds with an updated issue object. If the request body or issue_id parameter is invalid, the server responds with an error. Permission is denied when the issue does not belong to the user.
 *    tags: [Issues]
 *    parameters:
 *      - in: path
 *        name: issue_id
 *        required: true
 *        schema:
 *          type: integer
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: "#/components/schemas/IssueRequest"
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                issue:
 *                  $ref: "#/components/schemas/Issue"
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
  .patch(verifyToken, patchIssueByIssueId)


/**
 * @swagger
 * /api/issues/{issue_id}:
 *  delete:
 *    security:
 *      - bearerAuth: []
 *    summary: Remove an issue from the database
 *    description: Removes the issue and all associated data from the database. If the issue_id parameter is invalid, the server responds with an error. Permission is denied when the issue does not belong to the user.
 *    tags: [Issues]
 *    parameters:
 *      - in: path
 *        name: issue_id
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
  .delete(verifyToken, deleteIssueByIssueId)


issuesRouter.route("/issues/:issue_id/resolve")


/**
 * @swagger
 * /api/issues/{issue_id}/resolve:
 *  patch:
 *    security:
 *      - bearerAuth: []
 *    summary: Resolve an issue
 *    description: Responds with an updated issue object. If the issue is already resolved or the issue_id parameter is invalid, the server responds with an error. Permission is denied when the issue does not belong to the user.
 *    tags: [Issues]
 *    parameters:
 *      - in: path
 *        name: issue_id
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
 *              isResolved:
 *                type: boolean
 *                example: true
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                issue:
 *                  $ref: "#/components/schemas/Issue"
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
  .patch(verifyToken, resolveIssueByIssueId)


issuesRouter.route("/issues/:issue_id/unresolve")


/**
 * @swagger
 * /api/issues/{issue_id}/unresolve:
 *  patch:
 *    security:
 *      - bearerAuth: []
 *    summary: Unresolve an issue
 *    description: Responds with an updated issue object. If the issue is already unresolved or the issue_id parameter is invalid, the server responds with an error. Permission is denied when the issue does not belong to the user.
 *    tags: [Issues]
 *    parameters:
 *      - in: path
 *        name: issue_id
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
 *              isResolved:
 *                type: boolean
 *                example: false
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                issue:
 *                  $ref: "#/components/schemas/Issue"
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
  .patch(verifyToken, unresolveIssueByIssueId)
