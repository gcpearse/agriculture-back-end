import QueryString from "qs"
import { db } from "../db"
import { Crop } from "../types/crop-types"
import { getPlotOwnerId } from "../utils/db-query-utils"
import { verifyPagination, verifyParamIsPositiveInt, verifyPermission } from "../utils/verification-utils"
import format from "pg-format"


export const selectCropsByPlotId = async (authUserId: number, plot_id: number, { name, sort = "crop_id", order = "asc", limit = "10", page = "1" }: QueryString.ParsedQs): Promise<Crop[]> => {

  await verifyParamIsPositiveInt(plot_id)

  await verifyParamIsPositiveInt(+limit)

  await verifyParamIsPositiveInt(+page)

  const owner_id = await getPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id, "Permission to view crop data denied")

  const validValues = {
    sort: ["crop_id", "name", "date_planted", "harvest_date"],
    order: ["asc", "desc"]
  }

  if (!validValues.sort.includes(sort as string) || !validValues.order.includes(order as string)) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "No results found for that query"
    })
  }

  const cropCount = await db.query(`
    SELECT COUNT(crop_id)
    FROM crops
    WHERE plot_id = $1;
    `, [plot_id])

  await verifyPagination(+page, +limit, cropCount.rows[0].count)

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

  if (name) {
    query += format(`
      AND crops.name ILIKE %L
      `, `%${name}%`)
  }

  if (sort === "date_planted" || sort === "harvest_date") {
    query += `
    AND crops.${sort} IS NOT NULL
    `
  }

  query += `
  GROUP BY crops.crop_id
  `

  if (sort === "date_planted" || sort === "harvest_date") {
    order = "desc"
  }

  query += `
  ORDER BY ${sort} ${order}
  LIMIT ${limit}
  OFFSET ${(+page - 1) * +limit}
  `

  const result = await db.query(`${query};`, [plot_id])

  return result.rows
}
