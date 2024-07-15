import QueryString from "qs"
import { db } from "../db"
import format from "pg-format"
import { Plot } from "../types/plot-types"
import { checkPlotNameConflict, getValidPlotTypes, verifyPlotOwner } from "../utils/db-query-utils"
import { verifyPermission } from "../utils/verification-utils"


export const selectPlotsByOwner = async (authUserId: number, owner_id: number, { type }: QueryString.ParsedQs): Promise<Plot[]> => {

  await verifyPermission(authUserId, owner_id, "Permission to view plot data denied")

  let query = `
  SELECT * FROM plots
  WHERE owner_id = $1
  `

  const validPlotTypes = await getValidPlotTypes(owner_id)

  const isValidPlotType = validPlotTypes.includes(type as string)

  if (type && !isValidPlotType) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "No results found for that query"
    })
  }

  if (type) query += format(`AND type = %L`, type)

  const result = await db.query(query, [owner_id])

  return result.rows
}


export const insertPlotByOwner = async (authUserId: number, owner_id: number, plot: Plot): Promise<Plot> => {

  await verifyPermission(authUserId, owner_id, "Permission to create plot denied")

  await checkPlotNameConflict(owner_id, plot.name)

  const result = await db.query(`
    INSERT INTO plots
      (owner_id, name, type, description, location, area)
    VALUES
      ($1, $2, $3, $4, $5, $6)
    RETURNING *;
    `,
    [plot.owner_id, plot.name, plot.type.toLowerCase(), plot.description, plot.location, plot.area])

  return result.rows[0]
}


export const selectPlotByPlotId = async (authUserId: number, owner_id: number, plot_id: number): Promise<Plot> => {

  await verifyPermission(authUserId, owner_id, "Permission to view plot data denied")

  return verifyPlotOwner(plot_id, owner_id, "Permission to view plot data denied")
}


export const updatePlotByPlotId = async (authUserId: number, owner_id: number, plot_id: number, plot: Plot): Promise<Plot> => {

  await verifyPermission(authUserId, owner_id, "Permission to edit plot data denied")

  await verifyPlotOwner(plot_id, owner_id, "Permission to edit plot data denied")

  const currentPlotName = await db.query(`
    SELECT name
    FROM plots
    WHERE plot_id = $1
    `,
    [plot_id])

  if (currentPlotName.rows[0].name !== plot.name) {
    await checkPlotNameConflict(owner_id, plot.name)
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
    [plot.name, plot.type.toLowerCase(), plot.description, plot.location, plot.area, plot_id])

  return result.rows[0]
}
