import QueryString from "qs"
import { db } from "../db"
import format from "pg-format"
import { Plot, PlotRequest } from "../types/plot-types"
import { checkPlotNameConflict, getPlotOwnerId, searchForUserId, validatePlotType } from "../utils/db-query-utils"
import { verifyPermission, verifyParamIsPositiveInt, verifyPagination } from "../utils/verification-utils"


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
): Promise<Plot[]> => {

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

  let query = `
  SELECT * 
  FROM plots
  WHERE owner_id = $1
  `

  if (name) {
    query += format(`
      AND name ILIKE %L
      `, `%${name}%`)
  }

  const isValidPlotType = await validatePlotType(type as string)

  if (type && !isValidPlotType) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "No results found for that query"
    })
  }

  if (type) {
    query += format(`
      AND type = %L
      `, type)
  }

  if (sort === "name") {
    order = "asc"
  }

  query += `
  ORDER BY ${sort} ${order}, name
  LIMIT ${limit}
  OFFSET ${(+page - 1) * +limit}
  `

  const result = await db.query(`${query};`, [owner_id])

  await verifyPagination(+page, result.rows.length)

  return result.rows
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
): Promise<Plot> => {

  await verifyParamIsPositiveInt(plot_id)

  const owner_id = await getPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id, "Permission to view plot data denied")

  const result = await db.query(`
    SELECT * 
    FROM plots
    WHERE plot_id = $1;
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
