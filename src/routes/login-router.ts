import { Router } from "express"
import { postLogin } from "../controllers/auth-controllers"


export const loginRouter = Router()


/**
 * @swagger
 * /api/login:
 *  post:
 *    summary: Log in a user
 *    description: Responds with a JSON Web Token. The server responds with an error if the username does not exist or the password is incorrect.
 *    tags: [Login]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                example: carrot_king
 *              password:
 *                type: string
 *                example: carrots123
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              properties:
 *                token:
 *                  type: string
 *                  example: jsonwebtoken
 *      404:
 *        description: Not Found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Username not found"
 *      401:
 *        description: Unauthorized
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Incorrect password"
 */
loginRouter.post("/login", postLogin)
