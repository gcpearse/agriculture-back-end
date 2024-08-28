import format from "pg-format"
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

  await verifyPermission(authUserId, owner_id)

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


export const insertCropNoteByCropId = async (
  authUserId: number,
  crop_id: number,
  note: { body: string}
): Promise<CropNote> => {

  await verifyValueIsPositiveInt(crop_id)

  const owner_id = await getCropOwnerId(crop_id)

  await verifyPermission(authUserId, owner_id)

  const result = await db.query(format(`
    INSERT INTO crop_notes (
      crop_id,
      body
    )
    VALUES
      %L
    RETURNING *;
    `,
    [[
      crop_id,
      note.body
    ]]
  ))

  return result.rows[0]
}


export const removeCropNotesByCropId = async (
  authUserId: number,
  crop_id: number
): Promise<void> => {

  await verifyValueIsPositiveInt(crop_id)

  const owner_id = await getCropOwnerId(crop_id)

  await verifyPermission(authUserId, owner_id)

  await db.query(`
    DELETE FROM crop_notes
    WHERE crop_id = $1
    RETURNING *;
    `,
    [crop_id]
  )
}
