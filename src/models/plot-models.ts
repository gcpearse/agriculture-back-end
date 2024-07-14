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

  const validTypes = await getValidTypes(owner_id)

  if (type) {
    if (validTypes.includes(type as string)) {
      query += format(`AND type = %L`, type)
    } else {
      return Promise.reject({
        status: 400,
        message: "Invalid query"
      })
    }
  }

  const result = await db.query(query, [owner_id])

  return result.rows
}


const getValidTypes = async (owner_id: number): Promise<string[]> => {

  const validTypes = await db.query(`
    SELECT DISTINCT type
    FROM plots
    WHERE owner_id = $1
    `,
    [owner_id])

  return validTypes.rows.map(row => row.type)
}
