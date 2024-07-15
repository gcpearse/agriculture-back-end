import QueryString from "qs"
import { db } from "../db"
import format from "pg-format"
import { Plot } from "../types/plot-types"
import { getValidPlotTypes } from "../utils/db-query-utils"
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


export const selectPlotByPlotId = async (authUserId: number, owner_id: number, plot_id: number) => {

  await verifyPermission(authUserId, owner_id, "Permission to view plot data denied")

  const result = await db.query(`
    SELECT * FROM plots
    WHERE plot_id = $1
    AND owner_id = $2;
    `,
    [plot_id, owner_id])

  if (!result.rowCount) {
    return Promise.reject({
      status: 403,
      message: "Forbidden",
      details: "Permission to view plot data denied"
    })
  }

  return result.rows[0]
}
