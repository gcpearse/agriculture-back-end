import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { deleteUserByUsername, getUserByUsername, patchPasswordByUsername, patchUserByUsername } from "../controllers/user-controllers"


export const usersRouter = Router()


usersRouter.route("/users/:username")

/**
 * @swagger
 * /api/users/{username}:
 *  get:
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
 *              type: object
 *              properties:
 *                user_id:
 *                  type: integer
 *                  example: 1
 *                username:
 *                  type: string
 *                  example: carrot_king
 *                first_name:
 *                  type: string
 *                  example: John
 *                surname:
 *                  type: string
 *                  example: Smith
 *                unit_preference:
 *                  type: string
 *                  example: imperial
 *      403:
 *        description: Forbidden
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Access to user data denied"
 */
  .get(verifyToken, getUserByUsername)

/**
 * @swagger
 * /api/users/{username}:
 *  patch:
 *    summary: Update a user's details
 *    description: Responds with an updated user object. Permission is denied when the current user's username does not match the target username. 
 *    tags: [Users]
 *    parameters:
 *      - name: username
 *        in: path
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
 *              first_name:
 *                type: string
 *                example: Johnny
 *              surname:
 *                type: string
 *                example: Smith-Jones
 *              unit_preference:
 *                type: string    
 *                example: metric
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              properties:
 *                user_id:
 *                  type: integer
 *                  example: 1
 *                username:
 *                  type: string
 *                  example: carrot_king
 *                first_name:
 *                  type: string
 *                  example: Johnny
 *                surname:
 *                  type: string
 *                  example: Smith-Jones
 *                unit_preference:
 *                  type: string
 *                  example: metric
 *      403:
 *        description: Forbidden
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Permission to edit user data denied"
 */
  .patch(verifyToken, patchUserByUsername)

/**
 * @swagger
 * /api/users/{username}:
 *  delete:
 *    summary: Delete a user's details
 *    description: Removes the user from the database. Permission is denied when the current user's username does not match the target username.
 *    tags: [Users]
 *    parameters:
 *      - name: username
 *        in: path
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
 *                  example: "Permission to delete user data denied"
 */
  .delete(verifyToken, deleteUserByUsername)

/**
 * @swagger
 * /api/users/{username}/password:
 *  patch:
 *    summary: Update a user's password
 *    description: Responds with an updated user object without displaying the password property. Permission is denied when the current user's username does not match the target username.
 *    tags: [Users]
 *    parameters:
 *      - name: username
 *        in: path
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
 *              properties:
 *                user_id:
 *                  type: integer
 *                  example: 1
 *                username:
 *                  type: string
 *                  example: carrot_king
 *                first_name:
 *                  type: string
 *                  example: John
 *                surname:
 *                  type: string
 *                  example: Smith
 *                unit_preference:
 *                  type: string
 *                  example: imperial
 *      403:
 *        description: Forbidden
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Permission to change password denied"
 */
usersRouter.patch("/users/:username/password", verifyToken, patchPasswordByUsername)
