import QueryString from "qs"
import { db } from "../db"
import { Crop, CropRequest, ExtendedCrop } from "../types/crop-types"
import { fetchCropOwnerId, fetchPlotOwnerId, fetchSubdivisionPlotId, confirmCropCategoryIsValid } from "../utils/db-queries"
import { verifyPagination, verifyValueIsPositiveInt, verifyPermission, verifyQueryValue } from "../utils/verification"
import format from "pg-format"
import { QueryResult } from "pg"
import { Count } from "../types/aggregation-types"


export const selectCropsByPlotId = async (
  authUserId: number,
  plot_id: number,
  {
    name,
    category,
    sort = "name",
    order,
    limit = "10",
    page = "1"
  }: QueryString.ParsedQs
): Promise<[ExtendedCrop[], number]> => {

  for (const value of [plot_id, +limit, +page]) {
    await verifyValueIsPositiveInt(value)
  }

  const owner_id = await fetchPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id)

  await verifyQueryValue(["crop_id", "name", "date_planted", "harvest_date"], sort as string)

  if (order) {
    await verifyQueryValue(["asc", "desc"], order as string)
  } else {
    sort === "name" || sort === "harvest_date" ? order = "asc" : order = "desc"
  }

  let query = `
  SELECT
    crops.*,
    subdivisions.name
    AS subdivision_name,
    COUNT(DISTINCT crop_notes.note_id)::INT
    AS note_count,
    COUNT(DISTINCT crop_images.image_id)::INT
    AS image_count
  FROM crops
  LEFT JOIN subdivisions
  ON crops.subdivision_id = subdivisions.subdivision_id
  LEFT JOIN crop_notes
  ON crops.crop_id = crop_notes.crop_id
  LEFT JOIN crop_images
  ON crops.crop_id = crop_images.crop_id
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

  if (category) {
    await confirmCropCategoryIsValid(category as string, true)

    query += format(`
      AND crops.category ILIKE %L
      `, category)

    countQuery += format(`
      AND crops.category ILIKE %L
      `, category)
  }

  if (sort === "date_planted" || sort === "harvest_date") {
    query += format(`
      AND crops.%I IS NOT NULL
      `, sort)

    countQuery += format(`
      AND crops.%I IS NOT NULL
      `, sort)
  }

  query += format(`
    GROUP BY crops.crop_id, subdivisions.name
    ORDER BY %s %s, crops.name
    LIMIT %L
    OFFSET %L
    `, sort, order, limit, (+page - 1) * +limit)

  const result: QueryResult<ExtendedCrop> = await db.query(query, [plot_id])

  await verifyPagination(+page, result.rows.length)

  const countResult: QueryResult<Count> = await db.query(countQuery, [plot_id])

  return Promise.all([result.rows, countResult.rows[0].count])
}


export const insertCropByPlotId = async (
  authUserId: number,
  plot_id: number,
  crop: CropRequest
): Promise<Crop> => {

  await verifyValueIsPositiveInt(plot_id)

  const owner_id = await fetchPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id)

  await confirmCropCategoryIsValid(crop.category, false)

  const result: QueryResult<Crop> = await db.query(format(`
    INSERT INTO crops (
      plot_id, 
      name, 
      variety, 
      category, 
      quantity, 
      date_planted, 
      harvest_date
    )
    VALUES
      %L
    RETURNING *;
    `,
    [[
      plot_id,
      crop.name,
      crop.variety,
      crop.category,
      crop.quantity,
      crop.date_planted,
      crop.harvest_date
    ]]
  ))

  return result.rows[0]
}


export const selectCropsBySubdivisionId = async (
  authUserId: number,
  subdivision_id: number,
  {
    name,
    category,
    sort = "name",
    order,
    limit = "10",
    page = "1"
  }: QueryString.ParsedQs
): Promise<[ExtendedCrop[], number]> => {

  for (const value of [subdivision_id, +limit, +page]) {
    await verifyValueIsPositiveInt(value)
  }

  const plot_id = await fetchSubdivisionPlotId(subdivision_id)

  const owner_id = await fetchPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id)

  await verifyQueryValue(["crop_id", "name", "date_planted", "harvest_date"], sort as string)

  if (order) {
    await verifyQueryValue(["asc", "desc"], order as string)
  } else {
    sort === "name" || sort === "harvest_date" ? order = "asc" : order = "desc"
  }

  let query = `
  SELECT
    crops.*,
    COUNT(DISTINCT crop_notes.note_id)::INT
    AS note_count,
    COUNT(DISTINCT crop_images.image_id)::INT
    AS image_count
  FROM crops
  LEFT JOIN crop_notes
  ON crops.crop_id = crop_notes.crop_id
  LEFT JOIN crop_images
  ON crops.crop_id = crop_images.crop_id
  WHERE crops.subdivision_id = $1
  `

  let countQuery = `
  SELECT COUNT(crop_id)::INT
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

  if (category) {
    await confirmCropCategoryIsValid(category as string, true)

    query += format(`
      AND crops.category ILIKE %L
      `, category)

    countQuery += format(`
      AND crops.category ILIKE %L
      `, category)
  }

  if (sort === "date_planted" || sort === "harvest_date") {
    query += format(`
      AND crops.%I IS NOT NULL
      `, sort)

    countQuery += format(`
      AND crops.%I IS NOT NULL
      `, sort)
  }

  query += format(`
    GROUP BY crops.crop_id
    ORDER BY %s %s, crops.name
    LIMIT %L
    OFFSET %L
    `, sort, order, limit, (+page - 1) * +limit)

  const result: QueryResult<ExtendedCrop> = await db.query(query, [subdivision_id])

  await verifyPagination(+page, result.rows.length)

  const countResult: QueryResult<Count> = await db.query(countQuery, [subdivision_id])

  return Promise.all([result.rows, countResult.rows[0].count])
}


export const insertCropBySubdivisionId = async (
  authUserId: number,
  subdivision_id: number,
  crop: CropRequest
): Promise<Crop> => {

  await verifyValueIsPositiveInt(subdivision_id)

  const plot_id = await fetchSubdivisionPlotId(subdivision_id)

  const owner_id = await fetchPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id)

  await confirmCropCategoryIsValid(crop.category, false)

  const result: QueryResult<Crop> = await db.query(format(`
    INSERT INTO crops (
      plot_id, 
      subdivision_id, 
      name, 
      variety, 
      category, 
      quantity, 
      date_planted, 
      harvest_date
    )
    VALUES
      %L
    RETURNING *;
    `,
    [[
      plot_id,
      subdivision_id,
      crop.name,
      crop.variety,
      crop.category,
      crop.quantity,
      crop.date_planted,
      crop.harvest_date
    ]]
  ))

  return result.rows[0]
}


export const selectCropByCropId = async (
  authUserId: number,
  crop_id: number
): Promise<ExtendedCrop> => {

  await verifyValueIsPositiveInt(crop_id)

  const owner_id = await fetchCropOwnerId(crop_id)

  await verifyPermission(authUserId, owner_id)

  const result: QueryResult<ExtendedCrop> = await db.query(`
    SELECT
      crops.*,
      plots.name
      AS plot_name,
      subdivisions.name
      AS subdivision_name,
      COUNT(DISTINCT crop_notes.note_id)::INT
      AS note_count,
      COUNT(DISTINCT crop_images.image_id)::INT
      AS image_count
    FROM crops
    LEFT JOIN plots
    ON crops.plot_id = plots.plot_id
    LEFT JOIN subdivisions
    ON crops.subdivision_id = subdivisions.subdivision_id
    LEFT JOIN crop_notes
    ON crops.crop_id = crop_notes.crop_id
    LEFT JOIN crop_images
    ON crops.crop_id = crop_images.crop_id
    WHERE crops.crop_id = $1
    GROUP BY crops.crop_id, plots.name, subdivisions.name;
    `,
    [crop_id]
  )

  return result.rows[0]
}


export const updateCropByCropId = async (
  authUserId: number,
  crop_id: number,
  crop: CropRequest
): Promise<Crop> => {

  await verifyValueIsPositiveInt(crop_id)

  const owner_id = await fetchCropOwnerId(crop_id)

  await verifyPermission(authUserId, owner_id)

  await confirmCropCategoryIsValid(crop.category, false)

  const result: QueryResult<Crop> = await db.query(`
    UPDATE crops
    SET
      name = $1,
      variety = $2,
      category = $3,
      quantity = $4,
      date_planted = $5,
      harvest_date = $6
    WHERE crop_id = $7
    RETURNING *;
    `,
    [
      crop.name,
      crop.variety,
      crop.category,
      crop.quantity,
      crop.date_planted,
      crop.harvest_date,
      crop_id
    ]
  )

  return result.rows[0]
}


export const removeCropByCropId = async (
  authUserId: number,
  crop_id: number
): Promise<void> => {

  await verifyValueIsPositiveInt(crop_id)

  const owner_id = await fetchCropOwnerId(crop_id)

  await verifyPermission(authUserId, owner_id)

  await db.query(`
    DELETE FROM crops
    WHERE crop_id = $1;
    `,
    [crop_id]
  )
}


export const updateAssociatedPlotByCropId = async (
  authUserId: number,
  crop_id: number,
  { plot_id }: { plot_id: number }
): Promise<Crop> => {

  await verifyValueIsPositiveInt(crop_id)

  let owner_id = await fetchCropOwnerId(crop_id)

  await verifyPermission(authUserId, owner_id)

  if (plot_id) {
    owner_id = await fetchPlotOwnerId(plot_id)

    await verifyPermission(authUserId, owner_id)
  }

  const result: QueryResult<Crop> = await db.query(`
    UPDATE crops
    SET 
      plot_id = $1,
      subdivision_id = NULL
    WHERE crop_id = $2
    RETURNING *;
    `,
    [plot_id, crop_id]
  )

  return result.rows[0]
}


export const updateAssociatedSubdivisionByCropId = async (
  authUserId: number,
  crop_id: number,
  { subdivision_id }: { subdivision_id: number }
): Promise<Crop> => {

  await verifyValueIsPositiveInt(crop_id)

  let owner_id = await fetchCropOwnerId(crop_id)

  await verifyPermission(authUserId, owner_id)

  if (subdivision_id) {
    const plot_id = await fetchSubdivisionPlotId(subdivision_id)

    owner_id = await fetchPlotOwnerId(plot_id)

    await verifyPermission(authUserId, owner_id)

    const validIds = await db.query(`
      SELECT subdivisions.subdivision_id
      FROM subdivisions
      JOIN crops
      ON subdivisions.plot_id = crops.plot_id
      WHERE crops.crop_id = $1;
      `,
      [crop_id]
    )

    if (!validIds.rows.map(row => row.subdivision_id).includes(subdivision_id)) {
      return Promise.reject({
        status: 400,
        message: "Bad Request",
        details: "Invalid subdivision of current plot"
      })
    }
  }

  const result: QueryResult<Crop> = await db.query(`
    UPDATE crops
    SET 
      subdivision_id = $1
    WHERE crop_id = $2
    RETURNING *;
    `,
    [subdivision_id, crop_id]
  )

  return result.rows[0]
}
