import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { getIssuesByPlotId } from "../controllers/issues-controllers"


export const issuesRouter = Router()


issuesRouter.route("/issues/plots/:plot_id")


/**
 * @swagger
 * /api/issues/plots/{plot_id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve a plot's issues
 *    description: Responds with an array of issue objects. If the plot_id parameter is invalid, the server responds with an error. Permission is denied when the plot does not belong to the user.
 *    tags: [Issues]
 *    parameters:
 *      - in: path
 *        name: plot_id
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
 *                issues:
 *                  type: array
 *                  items:
 *                    $ref: "#/components/schemas/Issue"
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
