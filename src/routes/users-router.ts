import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { deleteUserByUserId, getUserByUserId, getUsers, patchPasswordByUserId, patchRoleByUserId, patchUserByUserId } from "../controllers/users-controllers"


export const usersRouter = Router()


usersRouter.route("/users")


/**
 * @swagger
 * /api/users:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve all users' details
 *    description: Responds with an array of user objects. Results can be filtered by role or unit_system and sorted by user_id, email, first_name, or surname. If a parameter is invalid, the server responds with an error. Permission is denied when the user is not an admin.
 *    tags: [Users]
 *    parameters:
 *      - in: query
 *        name: role
 *        schema:
 *          type: string
 *      - in: query
 *        name: unit_system
 *        schema:
 *          type: string
 *      - in: query
 *        name: sort
 *        schema:
 *          type: string
 *          enum:
 *            - user_id
 *            - email
 *            - first_name
 *            - surname
 *        default: user_id
 *      - in: query
 *        name: order
 *        schema:
 *          type: string
 *          enum:
 *            - asc
 *            - desc
 *        default: asc
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        default: 50
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
 *                users:
 *                  type: array
 *                  items:
 *                    $ref: "#/components/schemas/User"
 *                count:
 *                  type: integer
 *                  example: 1
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


usersRouter.route("/users/:user_id")


/**
 * @swagger
 * /api/users/{user_id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve a user's details
 *    description: Responds with a user object. If the user_id parameter is invalid, the server responds with an error. Permission is denied when the user's user ID does not match the user_id parameter.
 *    tags: [Users]
 *    parameters:
 *      - name: user_id
 *        in: path
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
 */
  .get(verifyToken, getUserByUserId)


/**
 * @swagger
 * /api/users/{user_id}:
 *  patch:
 *    security:
 *      - bearerAuth: []
 *    summary: Update a user's details
 *    description: Responds with an updated user object. If the request body or user_id parameter is invalid or the email would be a duplicate, the server responds with an error. Permission is denied when the user's user ID does not match the user_id parameter. 
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: user_id
 *        required: true
 *        schema:
 *          type: integer
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
  .patch(verifyToken, patchUserByUserId)


/**
 * @swagger
 * /api/users/{user_id}:
 *  delete:
 *    security:
 *      - bearerAuth: []
 *    summary: Delete a user from the database
 *    description: Removes the user and all associated data from the database. If the user_id parameter is invalid, the server responds with an error. Permission is denied when the user's user ID does not match the user_id parameter.
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: user_id
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
  .delete(verifyToken, deleteUserByUserId)


/**
 * @swagger
 * /api/users/{user_id}/password:
 *  patch:
 *    security:
 *      - bearerAuth: []
 *    summary: Update a user's password
 *    description: Responds with a success message. If the request body or user_id parameter is invalid or the old password is incorrect, the server responds with an error. Permission is denied when the user's user ID does not match the user_id parameter.
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: user_id
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
usersRouter.patch("/users/:user_id/password", verifyToken, patchPasswordByUserId)


/**
 * @swagger
 * /api/users/{user_id}/role:
 *  patch:
 *    security:
 *      - bearerAuth: []
 *    summary: Update a user's role
 *    description: Responds with an updated user object. If the request body or user_id parameter is invalid, the server responds with an error. Permission is denied when the user is not an admin.
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: user_id
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
 *              role:
 *                type: string
 *                example: supervisor
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
 */
usersRouter.patch("/users/:user_id/role", verifyToken, patchRoleByUserId)
