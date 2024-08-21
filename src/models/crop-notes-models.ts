import { db } from "../db"
import { CropNote } from "../types/note-types"
import { getCropOwnerId } from "../utils/db-queries"
import { verifyPermission, verifyValueIsPositiveInt } from "../utils/verification"


export const selectCropNotesByCropId = async (
  authUserId: number,
  crop_id: number
): Promise<CropNote[]> => {

  await verifyValueIsPositiveInt(crop_id)

  const owner_id = await getCropOwnerId(crop_id)

  await verifyPermission(authUserId, owner_id, "Permission to view crop note data denied")

  const result = await db.query(`
    SELECT *
    FROM crop_notes
    WHERE crop_id = $1
    ORDER BY created_at;
    `,
    [crop_id]
  )

  return result.rows
}
