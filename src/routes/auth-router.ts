import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { testAuth } from "../controllers/auth-controllers"


export const authRouter = Router()


/**
 * @swagger
 * /api/auth:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Test the authentication system
 *    description: Responds with a success message when authentication is successful. If the token cannot be verified, or valid user credentials have not been provided, the server responds with an error.
 *    tags: [Authentication]
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: OK
 *                details:
 *                  type: string
 *                  example: Authentication successful
 *      401:
 *        description: Unauthorized
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: Unauthorized
 *                details:
 *                  type: string
 *                  example: Invalid credentials provided
 *      403:
 *        description: Forbidden
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: Forbidden
 *                details:
 *                  type: string
 *                  example: Token could not be verified
 */
authRouter.get("/auth", verifyToken, testAuth)
