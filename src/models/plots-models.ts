import QueryString from "qs"
import { db } from "../db"
import format from "pg-format"
import { ExtendedPlot, Plot, PlotRequest } from "../types/plot-types"
import { checkPlotNameConflict, getPlotOwnerId, searchForUserId, validatePlotType } from "../utils/db-queries"
import { verifyPermission, verifyParamIsPositiveInt, verifyPagination } from "../utils/verification"


export const selectPlotsByOwner = async (
  authUserId: number,
  owner_id: number,
  {
    name,
    type,
    sort = "plot_id",
    order = "desc",
    limit = "10",
    page = "1"
  }: QueryString.ParsedQs
): Promise<[ExtendedPlot[], number]> => {

  await verifyParamIsPositiveInt(owner_id)

  await verifyParamIsPositiveInt(+limit)

  await verifyParamIsPositiveInt(+page)

  await searchForUserId(owner_id)

  await verifyPermission(authUserId, owner_id, "Permission to view plot data denied")

  const validValues = {
    sort: ["plot_id", "name"],
    order: ["asc", "desc"]
  }

  if (!validValues.sort.includes(sort as string) || !validValues.order.includes(order as string)) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "No results found for that query"
    })
  }

  const isValidPlotType = await validatePlotType(type as string)

  if (type && !isValidPlotType) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "No results found for that query"
    })
  }

  let query = `
  SELECT
    plots.*,
    COUNT(DISTINCT plot_images.image_id)::INT
    AS image_count,
    COUNT(DISTINCT subdivisions.subdivision_id)::INT
    AS subdivision_count,
    COUNT(DISTINCT crops.crop_id)::INT
    AS crop_count,
    COUNT(DISTINCT issues.issue_id)::INT
    AS issue_count,
    COUNT(DISTINCT jobs.job_id)::INT
    AS job_count
  FROM plots
  LEFT JOIN plot_images
  ON plots.plot_id = plot_images.plot_id
  LEFT JOIN subdivisions
  ON plots.plot_id = subdivisions.plot_id
  LEFT JOIN crops
  ON plots.plot_id = crops.plot_id
  LEFT JOIN issues
  ON plots.plot_id = issues.plot_id
  LEFT JOIN jobs
  ON plots.plot_id = jobs.plot_id
  WHERE plots.owner_id = $1
  `

  let countQuery = `
  SELECT COUNT(plot_id)::INT
  FROM plots
  WHERE owner_id = $1
  `

  if (name) {
    query += format(`
      AND plots.name ILIKE %L
      `, `%${name}%`)
    countQuery += format(`
      AND plots.name ILIKE %L
      `, `%${name}%`)
  }

  if (type) {
    query += format(`
      AND plots.type = %L
      `, type)
    countQuery += format(`
      AND plots.type = %L
      `, type)
  }

  query += `
  GROUP BY plots.plot_id
  `

  if (sort === "name") {
    order = "asc"
  }

  query += `
  ORDER BY ${sort} ${order}, plots.name
  LIMIT ${limit}
  OFFSET ${(+page - 1) * +limit}
  `

  const result = await db.query(`${query};`, [owner_id])

  await verifyPagination(+page, result.rows.length)

  const countResult = await db.query(`${countQuery};`, [owner_id])

  return Promise.all([result.rows, countResult.rows[0].count])
}


export const insertPlotByOwner = async (
  authUserId: number,
  owner_id: number,
  plot: PlotRequest
): Promise<Plot> => {

  await verifyParamIsPositiveInt(owner_id)

  await searchForUserId(owner_id)

  await verifyPermission(authUserId, owner_id, "Permission to create plot denied")

  await checkPlotNameConflict(owner_id, plot.name)

  const isValidPlotType = await validatePlotType(plot.type)

  if (!isValidPlotType) {
    return Promise.reject({
      status: 400,
      message: "Bad Request",
      details: "Invalid plot type"
    })
  }

  const result = await db.query(format(`
    INSERT INTO plots
      (owner_id, name, type, description, location, area)
    VALUES
      %L
    RETURNING *;
    `,
    [[owner_id, plot.name, plot.type, plot.description, plot.location, plot.area]]
  ))

  return result.rows[0]
}


export const selectPlotByPlotId = async (
  authUserId: number,
  plot_id: number
): Promise<ExtendedPlot> => {

  await verifyParamIsPositiveInt(plot_id)

  const owner_id = await getPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id, "Permission to view plot data denied")

  const result = await db.query(`
    SELECT
      plots.*,
      COUNT(DISTINCT plot_images.image_id)::INT
      AS image_count,
      COUNT(DISTINCT subdivisions.subdivision_id)::INT
      AS subdivision_count,
      COUNT(DISTINCT crops.crop_id)::INT
      AS crop_count,
      COUNT(DISTINCT issues.issue_id)::INT
      AS issue_count,
      COUNT(DISTINCT jobs.job_id)::INT
      AS job_count
    FROM plots
    LEFT JOIN plot_images
    ON plots.plot_id = plot_images.plot_id
    LEFT JOIN subdivisions
    ON plots.plot_id = subdivisions.plot_id
    LEFT JOIN crops
    ON plots.plot_id = crops.plot_id
    LEFT JOIN issues
    ON plots.plot_id = issues.plot_id
    LEFT JOIN jobs
    ON plots.plot_id = jobs.plot_id
    WHERE plots.plot_id = $1
    GROUP BY plots.plot_id;
    `,
    [plot_id])

  return result.rows[0]
}


export const updatePlotByPlotId = async (
  authUserId: number,
  plot_id: number,
  plot: PlotRequest
): Promise<Plot> => {

  await verifyParamIsPositiveInt(plot_id)

  const owner_id = await getPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id, "Permission to edit plot data denied")

  const currentPlotName = await db.query(`
    SELECT name
    FROM plots
    WHERE plot_id = $1;
    `,
    [plot_id])

  if (currentPlotName.rows[0].name !== plot.name) {
    await checkPlotNameConflict(owner_id, plot.name)
  }

  const isValidPlotType = await validatePlotType(plot.type)

  if (!isValidPlotType) {
    return Promise.reject({
      status: 400,
      message: "Bad Request",
      details: "Invalid plot type"
    })
  }

  const result = await db.query(`
    UPDATE plots
    SET
      name = $1,
      type = $2,
      description = $3,
      location = $4,
      area = $5
    WHERE plot_id = $6
    RETURNING *;
    `,
    [plot.name, plot.type, plot.description, plot.location, plot.area, plot_id])

  return result.rows[0]
}


export const removePlotByPlotId = async (
  authUserId: number,
  plot_id: number
): Promise<void> => {

  await verifyParamIsPositiveInt(plot_id)

  const owner_id = await getPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id, "Permission to delete plot data denied")

  await db.query(`
    DELETE FROM plots
    WHERE plot_id = $1
    RETURNING *;
    `,
    [plot_id])
}
