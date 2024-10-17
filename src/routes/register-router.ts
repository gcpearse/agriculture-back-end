import { Router } from "express"
import { postRegistration } from "../controllers/register-controllers"


export const registerRouter = Router()


/**
 * @swagger
 * /api/register:
 *  post:
 *    summary: Register a new user
 *    description: Responds with a user object. If the request body is invalid or the username or email already exists, the server responds with an error.
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
 *              email:
 *                type: string
 *                example: fred.flint@example.com
 *              first_name:
 *                type: string
 *                example: Fred
 *              surname:
 *                type: string
 *                example: Flint
 *              unit_system:
 *                type: string    
 *                example: metric
 *    responses:
 *      201:
 *        description: Created
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                user:
 *                  type: object
 *                  properties:
 *                    user_id:
 *                      type: integer
 *                      example: 3
 *                    username:
 *                      type: string
 *                      example: farmer123
 *                    email:
 *                      type: string
 *                      example: fred.flint@example.com
 *                    first_name:
 *                      type: string
 *                      example: Fred
 *                    surname:
 *                      type: string
 *                      example: Flint
 *                    role:
 *                      type: string
 *                      example: user
 *                    unit_system:
 *                      type: string
 *                      example: metric
 *      400:
 *        description: Bad Request
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: Bad Request
 *                details:
 *                  type: string
 *                  example: Invalid password format
 *      409:
 *        description: Conflict
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: Conflict
 *                details:
 *                  type: string
 *                  example: Username already exists
 */
registerRouter.post("/register", postRegistration)
