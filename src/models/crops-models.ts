import QueryString from "qs"
import { db } from "../db"
import { Crop, CropRequest, ExtendedCrop } from "../types/crop-types"
import { getPlotOwnerId, getSubdivisionPlotId } from "../utils/db-queries"
import { verifyPagination, verifyParamIsPositiveInt, verifyPermission } from "../utils/verification"
import format from "pg-format"


export const selectCropsByPlotId = async (
  authUserId: number,
  plot_id: number,
  {
    name,
    sort = "crop_id",
    order = "desc",
    limit = "10",
    page = "1"
  }: QueryString.ParsedQs
): Promise<[ExtendedCrop[], number]> => {

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

  let query = `
  SELECT
    crops.*,
    subdivisions.name
    AS subdivision_name,
    COUNT(crop_notes.crop_id)::INT
    AS note_count
  FROM crops
  LEFT JOIN subdivisions
  ON crops.subdivision_id = subdivisions.subdivision_id
  LEFT JOIN crop_notes
  ON crops.crop_id = crop_notes.crop_id
  WHERE crops.plot_id = $1
  `

  let countQuery = `
  SELECT COUNT(crop_id)::INT
  FROM crops
  WHERE plot_id = $1
  `

  if (name) {
    query += format(`
      AND crops.name ILIKE %L
      `, `%${name}%`)
    countQuery += format(`
      AND crops.name ILIKE %L
      `, `%${name}%`)
  }

  if (sort === "date_planted" || sort === "harvest_date") {
    query += `
    AND crops.${sort} IS NOT NULL
    `
    countQuery += `
    AND crops.${sort} IS NOT NULL
    `
  }

  query += `
  GROUP BY crops.crop_id, subdivisions.name
  `

  if (sort === "name") {
    order = "asc"
  }

  query += `
  ORDER BY ${sort} ${order}, name
  LIMIT ${limit}
  OFFSET ${(+page - 1) * +limit}
  `

  const result = await db.query(`${query};`, [plot_id])

  await verifyPagination(+page, result.rows.length)

  const countResult = await db.query(`${countQuery};`, [plot_id])

  return Promise.all([result.rows, countResult.rows[0].count])
}


export const insertCropByPlotId = async (
  authUserId: number,
  plot_id: number,
  crop: CropRequest
): Promise<Crop> => {

  await verifyParamIsPositiveInt(plot_id)

  const owner_id = await getPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id, "Permission to add crop denied")

  const result = await db.query(format(`
    INSERT INTO crops
      (plot_id, name, variety, quantity, date_planted, harvest_date)
    VALUES
      %L
    RETURNING *;
    `,
    [[plot_id, crop.name, crop.variety, crop.quantity, crop.date_planted, crop.harvest_date]]
  ))

  return result.rows[0]
}


export const selectCropsBySubdivisionId = async (
  authUserId: number,
  subdivision_id: number,
  {
    name,
    sort = "crop_id",
    order = "desc",
    limit = "10",
    page = "1"
  }: QueryString.ParsedQs
): Promise<[ExtendedCrop[], number]> => {

  await verifyParamIsPositiveInt(subdivision_id)

  await verifyParamIsPositiveInt(+limit)

  await verifyParamIsPositiveInt(+page)

  const plotId = await getSubdivisionPlotId(subdivision_id)

  const owner_id = await getPlotOwnerId(plotId)

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

  let query = `
  SELECT
    crops.*,
    COUNT(crop_notes.crop_id)::INT
    AS note_count
  FROM crops
  LEFT JOIN crop_notes
  ON crops.crop_id = crop_notes.crop_id
  WHERE crops.subdivision_id = $1
  `

  let countQuery = `
  SELECT COUNT(crop_id)
  FROM crops
  WHERE subdivision_id = $1
  `

  if (name) {
    query += format(`
      AND crops.name ILIKE %L
      `, `%${name}%`)
    countQuery += format(`
      AND crops.name ILIKE %L
      `, `%${name}%`)
  }

  if (sort === "date_planted" || sort === "harvest_date") {
    query += `
    AND crops.${sort} IS NOT NULL
    `
    countQuery += `
    AND crops.${sort} IS NOT NULL
    `
  }

  query += `
  GROUP BY crops.crop_id
  `

  if (sort === "name") {
    order = "asc"
  }

  query += `
  ORDER BY ${sort} ${order}, name
  LIMIT ${limit}
  OFFSET ${(+page - 1) * +limit}
  `

  const result = await db.query(`${query};`, [subdivision_id])

  await verifyPagination(+page, result.rows.length)

  const countResult = await db.query(`${countQuery};`, [subdivision_id])

  return Promise.all([result.rows, +countResult.rows[0].count])
}


export const insertCropBySubdivisionId = async (
  authUserId: number,
  subdivision_id: number,
  crop: CropRequest
): Promise<Crop> => {

  await verifyParamIsPositiveInt(subdivision_id)

  const plotId = await getSubdivisionPlotId(subdivision_id)

  const owner_id = await getPlotOwnerId(plotId)

  await verifyPermission(authUserId, owner_id, "Permission to add crop denied")

  const result = await db.query(format(`
    INSERT INTO crops
      (plot_id, subdivision_id, name, variety, quantity, date_planted, harvest_date)
    VALUES
      %L
    RETURNING *;
    `,
    [[plotId, subdivision_id, crop.name, crop.variety, crop.quantity, crop.date_planted, crop.harvest_date]]
  ))

  return result.rows[0]
}
