import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { deleteUserByUsername, getUserByUsername, patchPasswordByUsername, patchUserByUsername } from "../controllers/user-controllers"


export const usersRouter = Router()


usersRouter.route("/users/:username")


/**
 * @swagger
 * /api/users/{username}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve a user's details
 *    description: Responds with a user object. If no user is found, the server responds with an error. Permission is denied when the username does not belong to the current user.
 *    tags: [Users]
 *    parameters:
 *      - name: username
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/User"
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
  .get(verifyToken, getUserByUsername)

/**
 * @swagger
 * /api/users/{username}:
 *  patch:
 *    security:
 *      - bearerAuth: []
 *    summary: Update a user's details
 *    description: Responds with an updated user object. If the value of unit_preference is not valid, the email already exists for another user, or the username does not exist, the server responds with an error. Permission is denied when the username does not belong to the current user. 
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: username
 *        required: true
 *        schema:
 *          type: string
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                example: john.smith@example.com
 *              first_name:
 *                type: string
 *                example: John
 *              surname:
 *                type: string
 *                example: Smith
 *              unit_preference:
 *                type: string    
 *                example: imperial
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/User"
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
  .patch(verifyToken, patchUserByUsername)

/**
 * @swagger
 * /api/users/{username}:
 *  delete:
 *    security:
 *      - bearerAuth: []
 *    summary: Delete a user from the database
 *    description: Removes the user and all associated data from the database. If the username does not exist, the server responds with an error. Permission is denied when the username does not belong to the current user.
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: username
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      204:
 *        description: No Content
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
  .delete(verifyToken, deleteUserByUsername)

/**
 * @swagger
 * /api/users/{username}/password:
 *  patch:
 *    security:
 *      - bearerAuth: []
 *    summary: Update a user's password
 *    description: Responds with an updated user object without revealing the password property. If the username does not exist, the server responds with an error. Permission is denied when the username does not belong to the current user.
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: username
 *        required: true
 *        schema:
 *          type: string
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              password:
 *                type: string
 *                example: password123
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/User"
 *      400:
 *        description: Bad Request
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/BadRequest"
 *      401:
 *        description: Unauthorized
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Unauthorized"
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
usersRouter.patch("/users/:username/password", verifyToken, patchPasswordByUsername)
