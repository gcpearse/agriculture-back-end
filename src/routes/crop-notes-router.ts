import { Router } from "express"
import { verifyToken } from "../middleware/authentication"
import { getCropNotesByCropId } from "../controllers/crop-notes-controllers"


export const cropNotesRouter = Router()


cropNotesRouter.route("/crop_notes/crops/:crop_id")


/**
 * @swagger
 * /api/crop_notes/crops/{crop_id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Retrieve a crop's notes
 *    description: Responds with an array of crop note objects.
 *    tags: [Crop notes]
 *    parameters:
 *      - in: path
 *        name: crop_id
 *        required: true
 *        schema:
 *          type: integer
 */
  .get(verifyToken, getCropNotesByCropId)
