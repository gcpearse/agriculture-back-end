import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { deleteUserByUsername, getUserByUsername, getUsers, patchPasswordByUsername, patchUserByUsername } from "../controllers/users-controllers"


export const usersRouter = Router()


usersRouter.route("/users")


/**
 * @swagger
 * /api/users:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve all users' details
 *    description: Responds with an array of user objects. If a query parameter is invalid, the server responds with an error. Permission is denied when the current user is not an admin.
 *    tags: [Users]
 *    parameters:
 *      - in: query
 *        name: role
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                users:
 *                  type: array
 *                  items:
 *                    $ref: "#/components/schemas/User"
 *      400:
 *        description: BadRequest
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
 */
  .get(verifyToken, getUsers)


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
 *              type: object
 *              properties:
 *                user:
 *                  $ref: "#/components/schemas/User"
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
 *    description: Responds with an updated user object. If the value of unit_system is not valid, the email already exists for another user, or the username does not exist, the server responds with an error. Permission is denied when the username does not belong to the current user. 
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
 *            $ref: "#/components/schemas/UserRequest"
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                user:
 *                  $ref: "#/components/schemas/User"
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
 *    description: Responds with a success message. If the username does not exist, the server responds with an error. Permission is denied when the username does not belong to the current user.
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
 *              oldPassword:
 *                type: string
 *                example: password
 *              newPassword:
 *                type: string
 *                example: wordpass 
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
 *                  example: Password changed successfully
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
