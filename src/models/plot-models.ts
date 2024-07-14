import QueryString from "qs"
import { db } from "../db"
import format from "pg-format"


export const selectPlotsByOwner = async (authUserId: number, owner_id: number, { type }: QueryString.ParsedQs): Promise<any> => {

  if (authUserId !== owner_id) {
    return Promise.reject({
      status: 403,
      message: "Access to plot data denied"
    })
  }

  let query = `
  SELECT * FROM plots
  WHERE owner_id = $1
  `

  if (type) {
    query += format(`AND type = %L`, type)
  }

  const result = await db.query(query, [owner_id])

  if (!result.rowCount) {
    return Promise.reject({
      status: 404,
      message: "No plots found"
    })
  }

  return result.rows
}
