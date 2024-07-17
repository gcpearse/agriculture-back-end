import QueryString from "qs"
import { db } from "../db"
import { getPlotOwnerId, validateSubdivisionType } from "../utils/db-query-utils"
import { verifyPermission } from "../utils/verification-utils"
import { Subdivision } from "../types/subdivision-types"
import format from "pg-format"


export const selectSubdivisionsByPlotId = async (authUserId: number, plot_id: number, { type }: QueryString.ParsedQs): Promise<Subdivision[]> => {

  if (isNaN(plot_id)) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "Plot not found"
    })
  }

  const owner_id = await getPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id, "Permission to view plot subdivision data denied")

  let query = `
  SELECT * FROM subdivisions
  WHERE plot_id = $1
  `

  const isValidSubdivisionType = await validateSubdivisionType(type as string)

  if (type && !isValidSubdivisionType) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "No results found for that query"
    })
  }

  if (type) query += format(`AND type = %L`, type)

  const result = await db.query(query, [plot_id])

  return result.rows
}
