import QueryString from "qs"
import { db } from "../db"
import { Crop } from "../types/crop-types"
import { getPlotOwnerId } from "../utils/db-query-utils"
import { verifyParamIsNumber, verifyPermission } from "../utils/verification-utils"
import format from "pg-format"


export const selectCropsByPlotId = async (authUserId: number, plot_id: number, { name }: QueryString.ParsedQs): Promise<Crop[]> => {

  await verifyParamIsNumber(plot_id)

  const owner_id = await getPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id, "Permission to view crop data denied")

  let query = `
  SELECT
    crops.*,
    (
      SELECT subdivisions.name
      AS subdivision_name
      FROM subdivisions
      WHERE subdivisions.subdivision_id = crops.subdivision_id
    ),
    COUNT(crop_notes.crop_id)::INT
    AS note_count
  FROM crops
  LEFT OUTER JOIN crop_notes
  ON crops.crop_id = crop_notes.crop_id
  WHERE crops.plot_id = $1
  `

  if (name) query += format(`AND crops.name ILIKE %L`, `%${name}%`)

  query += `GROUP BY crops.crop_id;`

  const result = await db.query(query, [plot_id])

  return result.rows
}
