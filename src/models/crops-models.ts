import QueryString from "qs"
import { db } from "../db"
import { Crop, CropRequest, ExtendedCrop } from "../types/crop-types"
import { getCropOwnerId, getPlotOwnerId, getSubdivisionPlotId, validateCropCategory } from "../utils/db-queries"
import { verifyPagination, verifyValueIsPositiveInt, verifyPermission, verifyQueryValue } from "../utils/verification"
import format from "pg-format"


export const selectCropsByPlotId = async (
  authUserId: number,
  plot_id: number,
  {
    name,
    category,
    sort = "crop_id",
    order = "desc",
    limit = "10",
    page = "1"
  }: QueryString.ParsedQs
): Promise<[ExtendedCrop[], number]> => {

  await verifyValueIsPositiveInt(plot_id)

  await verifyValueIsPositiveInt(+limit)

  await verifyValueIsPositiveInt(+page)

  const owner_id = await getPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id)

  await verifyQueryValue(["crop_id", "name", "date_planted", "harvest_date"], sort as string)

  await verifyQueryValue(["asc", "desc"], order as string)

  const isValidCropCategory = await validateCropCategory(category as string, true)

  if (category && !isValidCropCategory) {
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
    query += format(`
      AND crops.category ILIKE %L
      `, category)
    countQuery += format(`
      AND crops.category ILIKE %L
      `, category)
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
  ORDER BY ${sort} ${order}, crops.name
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

  await verifyValueIsPositiveInt(plot_id)

  const owner_id = await getPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id)

  const isValidCropCategory = await validateCropCategory(crop.category, false)

  if (!isValidCropCategory) {
    return Promise.reject({
      status: 400,
      message: "Bad Request",
      details: "Invalid crop category"
    })
  }

  const result = await db.query(format(`
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
    sort = "crop_id",
    order = "desc",
    limit = "10",
    page = "1"
  }: QueryString.ParsedQs
): Promise<[ExtendedCrop[], number]> => {

  await verifyValueIsPositiveInt(subdivision_id)

  await verifyValueIsPositiveInt(+limit)

  await verifyValueIsPositiveInt(+page)

  const plot_id = await getSubdivisionPlotId(subdivision_id)

  const owner_id = await getPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id)

  await verifyQueryValue(["crop_id", "name", "date_planted", "harvest_date"], sort as string)

  await verifyQueryValue(["asc", "desc"], order as string)

  const isValidCropCategory = await validateCropCategory(category as string, true)

  if (category && !isValidCropCategory) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "No results found for that query"
    })
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
    query += format(`
      AND crops.category ILIKE %L
      `, category)
    countQuery += format(`
      AND crops.category ILIKE %L
      `, category)
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
  ORDER BY ${sort} ${order}, crops.name
  LIMIT ${limit}
  OFFSET ${(+page - 1) * +limit}
  `

  const result = await db.query(`${query};`, [subdivision_id])

  await verifyPagination(+page, result.rows.length)

  const countResult = await db.query(`${countQuery};`, [subdivision_id])

  return Promise.all([result.rows, countResult.rows[0].count])
}


export const insertCropBySubdivisionId = async (
  authUserId: number,
  subdivision_id: number,
  crop: CropRequest
): Promise<Crop> => {

  await verifyValueIsPositiveInt(subdivision_id)

  const plot_id = await getSubdivisionPlotId(subdivision_id)

  const owner_id = await getPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id)

  const isValidCropCategory = await validateCropCategory(crop.category, false)

  if (!isValidCropCategory) {
    return Promise.reject({
      status: 400,
      message: "Bad Request",
      details: "Invalid crop category"
    })
  }

  const result = await db.query(format(`
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
): Promise<Crop> => {

  await verifyValueIsPositiveInt(crop_id)

  const owner_id = await getCropOwnerId(crop_id)

  await verifyPermission(authUserId, owner_id)

  const result = await db.query(`
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

  const owner_id = await getCropOwnerId(crop_id)

  await verifyPermission(authUserId, owner_id)

  const isValidCropCategory = await validateCropCategory(crop.category, false)

  if (!isValidCropCategory) {
    return Promise.reject({
      status: 400,
      message: "Bad Request",
      details: "Invalid crop category"
    })
  }

  const result = await db.query(`
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

  const owner_id = await getCropOwnerId(crop_id)

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

  let owner_id = await getCropOwnerId(crop_id)

  await verifyPermission(authUserId, owner_id)

  if (plot_id) {
    owner_id = await getPlotOwnerId(plot_id)

    await verifyPermission(authUserId, owner_id)
  }

  const result = await db.query(`
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

  let owner_id = await getCropOwnerId(crop_id)

  await verifyPermission(authUserId, owner_id)

  if (subdivision_id) {
    const plot_id = await getSubdivisionPlotId(subdivision_id)

    owner_id = await getPlotOwnerId(plot_id)

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

  const result = await db.query(`
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
