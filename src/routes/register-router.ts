import { Router } from "express"
import { postRegistration } from "../controllers/auth-controllers"


export const registerRouter = Router()


/**
 * @swagger
 * /api/register:
 *  post:
 *    summary: Register a new user
 *    description: Responds with a new user object without revealing the password property. If the username already exists, the server responds with a 409 Conflict error.
 *    tags: [Register]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                example: farmer123
 *              password:
 *                type: string
 *                example: password123
 *              first_name:
 *                type: string
 *                example: Fred
 *              surname:
 *                type: string
 *                example: Flint
 *              uses_metric:
 *                type: boolean    
 *                example: true
 *    responses:
 *      201:
 *        description: Created
 *        content:
 *          application/json:
 *            schema:
 *              properties:
 *                user_id:
 *                  type: integer
 *                  example: 3
 *                username:
 *                  type: string
 *                  example: farmer123
 *                first_name:
 *                  type: string
 *                  example: Fred
 *                surname:
 *                  type: string
 *                  example: Flint
 *                uses_metric:
 *                  type: boolean
 *                  example: true
 *      409:
 *        description: Conflict
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Username already exists"
 */
registerRouter.post("/register", postRegistration)
