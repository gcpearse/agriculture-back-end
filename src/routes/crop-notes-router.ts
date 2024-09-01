import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { deleteCropNoteByNoteId, deleteCropNotesByCropId, getCropNotesByCropId, patchCropNoteByNoteId, postCropNoteByCropId } from "../controllers/crop-notes-controllers"


export const cropNotesRouter = Router()


cropNotesRouter.route("/crop_notes/crops/:crop_id")


/**
 * @swagger
 * /api/crop_notes/crops/{crop_id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve a crop's notes
 *    description: Responds with an array of crop note objects. If the crop_id parameter is invalid, the server responds with an error. Permission is denied when the crop does not belong to the user.
 *    tags: [Crop notes]
 *    parameters:
 *      - in: path
 *        name: crop_id
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
 *                notes:
 *                  type: array
 *                  items:
 *                    $ref: "#/components/schemas/CropNote"
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
  .get(verifyToken, getCropNotesByCropId)



/**
 * @swagger
 * /api/crop_notes/crops/{crop_id}:
 *  post:
 *    security:
 *      - bearerAuth: []
 *    summary: Add a new note to a crop
 *    description: Responds with a crop note object. If the request body or crop_id parameter is invalid, the server responds with an error. Permission is denied when the crop does not belong to the user.
 *    tags: [Crop notes]
 *    parameters:
 *      - in: path
 *        name: crop_id
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
 *              body:
 *                type: string
 *                example: These will need more water in future.
 *    responses:
 *      201:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                note:
 *                  $ref: "#/components/schemas/CropNote"
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
  .post(verifyToken, postCropNoteByCropId)


/**
 * @swagger
 * /api/crop_notes/crops/{crop_id}:
 *  delete:
 *    security:
 *      - bearerAuth: []
 *    summary: Delete a crop's notes from the database
 *    description: Removes all notes associated with the crop from the database. If the crop_id parameter is invalid, the server responds with an error. Permission is denied when the crop does not belong to the user.
 *    tags: [Crop notes]
 *    parameters:
 *      - in: path
 *        name: crop_id
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
  .delete(verifyToken, deleteCropNotesByCropId)


cropNotesRouter.route("/crop_notes/:note_id")


/**
 * @swagger
 * /api/crop_notes/{note_id}:
 *  patch:
 *    security:
 *      - bearerAuth: []
 *    summary: Update a crop note
 *    description: Responds with an updated crop note object. If the request body or note_id parameter is invalid, the server responds with an error. Permission is denied when the crop note does not belong to the user.
 *    tags: [Crop notes]
 *    parameters:
 *      - in: path
 *        name: note_id
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
 *              body:
 *                type: string
 *                example: These will need more water in future.
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                crop:
 *                  $ref: "#/components/schemas/CropNote"
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
  .patch(verifyToken, patchCropNoteByNoteId)


/**
 * @swagger
 * /api/crop_notes/{note_id}:
 *  delete:
 *    security:
 *      - bearerAuth: []
 *    summary: Delete a crop note from the database
 *    description: Removes the crop note from the database. If the note_id parameter is invalid, the server responds with an error. Permission is denied when the crop note does not belong to the user.
 *    tags: [Crop notes]
 *    parameters:
 *      - in: path
 *        name: note_id
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
  .delete(verifyToken, deleteCropNoteByNoteId)
