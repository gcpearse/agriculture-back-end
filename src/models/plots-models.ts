import QueryString from "qs"
import { db } from "../db"
import format from "pg-format"
import { ExtendedPlot, Plot, PlotRequest } from "../types/plot-types"
import { checkForPlotNameConflict, fetchPlotOwnerId, searchForUserId, confirmPlotTypeIsValid } from "../utils/db-queries"
import { verifyPermission, verifyValueIsPositiveInt, verifyPagination, verifyQueryValue } from "../utils/verification"
import { StatusResponse } from "../types/response-types"


export const selectPlotsByOwner = async (
  authUserId: number,
  owner_id: number,
  {
    name,
    type,
    sort = "name",
    order,
    limit = "10",
    page = "1"
  }: QueryString.ParsedQs
): Promise<[ExtendedPlot[], number]> => {

  for (const value of [owner_id, +limit, +page]) {
    await verifyValueIsPositiveInt(value)
  }

  await searchForUserId(owner_id)

  await verifyPermission(authUserId, owner_id)

  await verifyQueryValue(["plot_id", "name"], sort as string)

  if (order) {
    await verifyQueryValue(["asc", "desc"], order as string)
  } else {
    sort === "name" ? order = "asc" : order = "desc"
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
    await confirmPlotTypeIsValid(type as string, true)

    query += format(`
      AND plots.type ILIKE %L
      `, type)

    countQuery += format(`
      AND plots.type ILIKE %L
      `, type)
  }

  query += format(`
    GROUP BY plots.plot_id
    ORDER BY %s %s, plots.name
    LIMIT %L
    OFFSET %L
    `, sort, order, limit, (+page - 1) * +limit)

  const result = await db.query(query, [owner_id])

  await verifyPagination(+page, result.rows.length)

  const countResult = await db.query(countQuery, [owner_id])

  return Promise.all([result.rows, countResult.rows[0].count])
}


export const insertPlotByOwner = async (
  authUserId: number,
  owner_id: number,
  plot: PlotRequest
): Promise<Plot> => {

  await verifyValueIsPositiveInt(owner_id)

  await searchForUserId(owner_id)

  await verifyPermission(authUserId, owner_id)

  await checkForPlotNameConflict(owner_id, plot.name)

  await confirmPlotTypeIsValid(plot.type, false)

  const result = await db.query(format(`
    INSERT INTO plots (
      owner_id, 
      name, 
      type, 
      description, 
      location, 
      area
    )
    VALUES
      %L
    RETURNING *;
    `,
    [[
      owner_id,
      plot.name,
      plot.type,
      plot.description,
      plot.location,
      plot.area
    ]]
  ))

  return result.rows[0]
}


export const selectPinnedPlotsByOwner = async (
  authUserId: number,
  owner_id: number,
): Promise<Plot[]> => {

  await verifyValueIsPositiveInt(owner_id)

  await searchForUserId(owner_id)

  await verifyPermission(authUserId, owner_id)

  const result = await db.query(`
    SELECT *
    FROM plots
    WHERE owner_id = $1
    AND is_pinned IS TRUE
    ORDER BY name ASC;
    `,
    [owner_id]
  )

  return result.rows
}


export const selectPlotByPlotId = async (
  authUserId: number,
  plot_id: number
): Promise<ExtendedPlot> => {

  await verifyValueIsPositiveInt(plot_id)

  const owner_id = await fetchPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id)

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
    [plot_id]
  )

  return result.rows[0]
}


export const updatePlotByPlotId = async (
  authUserId: number,
  plot_id: number,
  plot: PlotRequest
): Promise<Plot> => {

  await verifyValueIsPositiveInt(plot_id)

  const owner_id = await fetchPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id)

  const currentPlotName = await db.query(`
    SELECT name
    FROM plots
    WHERE plot_id = $1;
    `,
    [plot_id]
  )

  if (currentPlotName.rows[0].name !== plot.name) {
    await checkForPlotNameConflict(owner_id, plot.name)
  }

  await confirmPlotTypeIsValid(plot.type, false)

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
    [
      plot.name,
      plot.type,
      plot.description,
      plot.location,
      plot.area,
      plot_id
    ]
  )

  return result.rows[0]
}


export const removePlotByPlotId = async (
  authUserId: number,
  plot_id: number
): Promise<void> => {

  await verifyValueIsPositiveInt(plot_id)

  const owner_id = await fetchPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id)

  await db.query(`
    DELETE FROM plots
    WHERE plot_id = $1;
    `,
    [plot_id]
  )
}


export const updateIsPinnedByPlotId = async (
  authUserId: number,
  plot_id: number,
  toggle: { bool: boolean }
): Promise<StatusResponse> => {

  await verifyValueIsPositiveInt(plot_id)

  const owner_id = await fetchPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id)

  if (toggle.bool !== true) {
    return Promise.reject({
      status: 400,
      message: "Bad Request",
      details: "Invalid boolean value"
    })
  }

  const countResult = await db.query(`
    SELECT COUNT(plots.plot_id)::INT 
    AS plot_count 
    FROM plots 
    WHERE owner_id = $1 
    AND is_pinned IS TRUE;
    `,
    [owner_id]
  )

  const count = countResult.rows[0].plot_count

  const isPinnedResult = await db.query(`
    SELECT is_pinned
    FROM plots
    WHERE plot_id = $1;
    `,
    [plot_id]
  )

  let isPinned = isPinnedResult.rows[0].is_pinned

  if (!isPinned && count === 4) {
    return Promise.reject({
      status: 400,
      message: "Bad Request",
      details: "Pin limit reached"
    })
  }

  const result = await db.query(`
    UPDATE plots
    SET
      is_pinned = NOT is_pinned
    WHERE plot_id = $1
    RETURNING is_pinned;
    `,
    [plot_id]
  )

  isPinned = result.rows[0].is_pinned

  return {
    message: "OK",
    details: `Plot ${isPinned ? "pinned" : "unpinned"} successfully`
  }
}
