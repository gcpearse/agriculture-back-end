import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { testAuth } from "../controllers/test-auth"


export const authRouter = Router()


/**
 * @swagger
 * /api/auth:
 *  get:
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
 */
authRouter.get("/auth", verifyToken, testAuth)
