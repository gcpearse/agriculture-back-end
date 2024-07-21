import { Router } from "express"


export const schemaRouter = Router()


/**
 * @swagger
 * components:
 *  schemas:
 *    BadRequest:
 *      type: object
 *      properties:
 *        message:
 *          type: string
 *          example: Bad Request
 *        details:
 *          type: string
 *          example: Invalid request
 *    Conflict:
 *      type: object
 *      properties:
 *        message:
 *          type: string
 *          example: Conflict
 *        details:
 *          type: string
 *          example: Content already exists
 *    Crop:
 *      type: object
 *      properties:
 *        crop_id:
 *          type: integer
 *          example: 1
 *        plot_id:
 *          type: integer
 *          example: 1
 *        subdivision_id:
 *          type: integer
 *          nullable: true
 *          example: null
 *        name:
 *          type: string
 *          example: carrot
 *        variety:
 *          type: string
 *          example: chantenay
 *        quantity:
 *          type: integer
 *          example: 20
 *        date_planted:
 *          type: string
 *          example: 2024-06-19T23:00:00.000Z
 *        harvest_date:
 *          type: string
 *          example: 2024-09-14T23:00:00.000Z
 *    Forbidden:
 *      type: object
 *      properties:
 *        message:
 *          type: string
 *          example: Forbidden
 *        details:
 *          type: string
 *          example: Permission denied
 *    NotFound:
 *      type: object
 *      properties:
 *        message:
 *          type: string
 *          example: Not Found
 *        details:
 *          type: string
 *          example: Result not found
 *    Plot:
 *      type: object
 *      properties:
 *        plot_id:
 *          type: integer
 *          example: 1
 *        owner_id:
 *          type: integer
 *          example: 1
 *        name:
 *          type: string
 *          example: John's Garden
 *        type:
 *          type: string
 *          example: garden
 *        description:
 *          type: string
 *          example: A vegetable garden
 *        location:
 *          type: string
 *          example: Farmville
 *        area:
 *          type: integer
 *          example: 100
 *    Subdivision:
 *      type: object
 *      properties:
 *        subdivision_id:
 *          type: integer
 *          example: 1
 *        plot_id:
 *          type: integer
 *          example: 1
 *        name:
 *          type: string
 *          example: Root Vegetable Bed
 *        type:
 *          type: string
 *          example: bed
 *        description:
 *          type: string
 *          example: Carrots, beetroots, and parsnips
 *        area:
 *          type: integer
 *          example: 10
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
 *    Unauthorized:
 *      type: object
 *      properties:
 *        message:
 *          type: string
 *          example: Unauthorized
 *        details:
 *          type: string
 *          example: Incorrect password
 */
