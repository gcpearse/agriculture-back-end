import format from "pg-format"
import { db } from "../db"
import { CropNote, NoteRequest } from "../types/note-types"
import { fetchCropNoteCropId, fetchCropOwnerId } from "../utils/db-queries"
import { verifyPermission, verifyValueIsPositiveInt } from "../utils/verification"


export const selectCropNotesByCropId = async (
  authUserId: number,
  crop_id: number
): Promise<CropNote[]> => {

  await verifyValueIsPositiveInt(crop_id)

  const owner_id = await fetchCropOwnerId(crop_id)

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
  note: NoteRequest
): Promise<CropNote> => {

  await verifyValueIsPositiveInt(crop_id)

  const owner_id = await fetchCropOwnerId(crop_id)

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

  const owner_id = await fetchCropOwnerId(crop_id)

  await verifyPermission(authUserId, owner_id)

  await db.query(`
    DELETE FROM crop_notes
    WHERE crop_id = $1;
    `,
    [crop_id]
  )
}


export const updateCropNoteByNoteId = async (
  authUserId: number,
  note_id: number,
  note: NoteRequest
): Promise<CropNote> => {

  await verifyValueIsPositiveInt(note_id)

  const crop_id = await fetchCropNoteCropId(note_id)

  const owner_id = await fetchCropOwnerId(crop_id)

  await verifyPermission(authUserId, owner_id)

  const result = await db.query(`
    UPDATE crop_notes
    SET
      body = $1
    WHERE note_id = $2
    RETURNING *;
    `,
    [note.body, note_id]
  )

  return result.rows[0]
}


export const removeCropNoteByNoteId = async (
  authUserId: number,
  note_id: number
): Promise<void> => {

  await verifyValueIsPositiveInt(note_id)

  const crop_id = await fetchCropNoteCropId(note_id)

  const owner_id = await fetchCropOwnerId(crop_id)

  await verifyPermission(authUserId, owner_id)

  await db.query(`
    DELETE FROM crop_notes
    WHERE note_id = $1;
    `,
    [note_id]
  )
}
