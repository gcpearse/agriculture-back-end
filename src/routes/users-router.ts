import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { deleteUserByUsername, getUserByUsername, patchPasswordByUsername, patchUserByUsername } from "../controllers/user-controllers"


export const usersRouter = Router()


/**
 * @swagger
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      properties:
 *        user_id:
 *          type: integer
 *          example: 1
 *        username:
 *          type: string
 *          example: carrot_king
 *        email:
 *          type: string
 *          example: john.smith@example.com
 *        first_name:
 *          type: string
 *          example: John
 *        surname:
 *          type: string
 *          example: Smith
 *        unit_preference:
 *          type: string
 *          example: imperial
 */


usersRouter.route("/users/:username")

/**
 * @swagger
 * /api/users/{username}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve a user's details
 *    description: Responds with a user object. Permission is denied when the current user's username does not match the target username.
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
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Forbidden"
 *                details:
 *                  type: string
 *                  example: "Permission to view user data denied"
 */
  .get(verifyToken, getUserByUsername)

/**
 * @swagger
 * /api/users/{username}:
 *  patch:
 *    security:
 *      - bearerAuth: []
 *    summary: Update a user's details
 *    description: Responds with an updated user object. The server will respond with an error if the value of unit_preference is not a valid enum value, or if the email already exists for another user. Permission is denied when the current user's username does not match the target username. 
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
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Bad Request"
 *                details:
 *                  type: string
 *                  example: "Invalid text representation"
 *      403:
 *        description: Forbidden
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Forbidden"
 *                details:
 *                  type: string
 *                  example: "Permission to edit user data denied"
 *      409:
 *        description: Conflict
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Conflict"
 *                details:
 *                  type: string
 *                  example: "Email already exists"
 */
  .patch(verifyToken, patchUserByUsername)

/**
 * @swagger
 * /api/users/{username}:
 *  delete:
 *    security:
 *      - bearerAuth: []
 *    summary: Delete a user from the database
 *    description: Removes the user and all associated data from the database. Permission is denied when the current user's username does not match the target username.
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
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Forbidden"
 *                details:
 *                  type: string
 *                  example: "Permission to delete user data denied"
 */
  .delete(verifyToken, deleteUserByUsername)

/**
 * @swagger
 * /api/users/{username}/password:
 *  patch:
 *    security:
 *      - bearerAuth: []
 *    summary: Update a user's password
 *    description: Responds with an updated user object without displaying the password property. Permission is denied when the current user's username does not match the target username.
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
 *      403:
 *        description: Forbidden
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Forbidden"
 *                details:
 *                  type: string
 *                  example: "Permission to edit password denied"
 */
usersRouter.patch("/users/:username/password", verifyToken, patchPasswordByUsername)
