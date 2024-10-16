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
 *          example: 1
 *        name:
 *          type: string
 *          example: Carrot
 *        variety:
 *          type: string
 *          nullable: true
 *          example: Chantenay
 *        category:
 *          type: string
 *          example: Vegetables
 *        quantity:
 *          type: integer
 *          nullable: true
 *          example: 20
 *        date_planted:
 *          type: string
 *          nullable: true
 *          example: 2024-06-19T23:00:00.000Z
 *        harvest_date:
 *          type: string
 *          nullable: true
 *          example: 2024-09-14T23:00:00.000Z
 *    CropNote:
 *      type: object
 *      properties:
 *        note_id:
 *          type: integer
 *          example: 1
 *        crop_id:
 *          type: integer
 *          example: 1
 *        body:
 *          type: string
 *          example: These will need more water in future.
 *        created_at:
 *          type: string
 *          example: 2024-07-01T11:05:59.959Z
 *    CropRequest:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *          example: Carrot
 *        variety:
 *          type: string
 *          nullable: true
 *          example: Chantenay
 *        category:
 *          type: string
 *          example: Vegetables
 *        quantity:
 *          type: integer
 *          nullable: true
 *          example: 20
 *        date_planted:
 *          type: string
 *          nullable: true
 *          example: 2024-06-19
 *        harvest_date:
 *          type: string
 *          nullable: true
 *          example: 2024-09-14
 *    Forbidden:
 *      type: object
 *      properties:
 *        message:
 *          type: string
 *          example: Forbidden
 *        details:
 *          type: string
 *          example: Permission denied
 *    Issue:
 *      type: object
 *      properties:
 *        issue_id:
 *          type: integer
 *          example: 1
 *        plot_id:
 *          type: integer
 *          example: 1
 *        subdivision_id:
 *          type: integer
 *          nullable: true
 *          example: 1
 *        title:
 *          type: string
 *          example: Broken gate
 *        description:
 *          type: string
 *          example: The gate has fallen off its hinges
 *        is_critical:
 *          type: boolean
 *          example: true
 *        is_resolved:
 *          type: boolean
 *          example: false
 *    IssueRequest:
 *      type: object
 *      properties:
 *        title:
 *          type: string
 *          example: Broken gate
 *        description:
 *          type: string
 *          example: The gate has fallen off its hinges
 *        is_critical:
 *          type: boolean
 *          example: true
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
 *          example: Garden
 *        description:
 *          type: string
 *          example: A vegetable garden
 *        location:
 *          type: string
 *          example: Farmville
 *        area:
 *          type: integer
 *          nullable: true
 *          example: 100
 *        is_pinned:
 *          type: boolean
 *          example: true
 *    PlotRequest:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *          example: John's Garden
 *        type:
 *          type: string
 *          example: Garden
 *        description:
 *          type: string
 *          example: A vegetable garden
 *        location:
 *          type: string
 *          example: Farmville
 *        area:
 *          type: integer
 *          nullable: true
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
 *          example: Bed
 *        description:
 *          type: string
 *          example: Carrots, beetroots, and parsnips
 *        area:
 *          type: integer
 *          nullable: true
 *          example: 10
 *    SubdivisionRequest:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *          example: Root Vegetable Bed
 *        type:
 *          type: string
 *          example: Bed
 *        description:
 *          type: string
 *          example: Carrots, beetroots, and parsnips
 *        area:
 *          type: integer
 *          nullable: true
 *          example: 10
 *    Unauthorized:
 *      type: object
 *      properties:
 *        message:
 *          type: string
 *          example: Unauthorized
 *        details:
 *          type: string
 *          example: Incorrect password
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
 *        role:
 *          type: string
 *          example: user
 *        unit_system:
 *          type: string
 *          example: imperial
 *    UserRequest:
 *      type: object
 *      properties:
 *        email:
 *          type: string
 *          example: john.smith@example.com
 *        first_name:
 *          type: string
 *          example: John
 *        surname:
 *          type: string
 *          example: Smith
 *        unit_system:
 *          type: string
 *          example: imperial
 */
