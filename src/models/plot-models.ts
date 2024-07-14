import QueryString from "qs"
import { db } from "../db"
import format from "pg-format"
import { Plot } from "../types/plot-types"


export const selectPlotsByOwner = async (authUserId: number, owner_id: number, { type }: QueryString.ParsedQs): Promise<Plot[]> => {

  if (authUserId !== owner_id) {
    return Promise.reject({
      status: 403,
      message: "Forbidden",
      details: "Permission to view plot data denied"
    })
  }

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


const getValidPlotTypes = async (owner_id: number): Promise<string[]> => {

  const validTypes = await db.query(`
    SELECT DISTINCT type
    FROM plots
    WHERE owner_id = $1
    `,
    [owner_id])

  return validTypes.rows.map(row => row.type)
}


export const selectPlotByPlotId = async (authUserId: number, owner_id: number, plot_id: number) => {

  if (authUserId !== owner_id) {
    return Promise.reject({
      status: 403,
      message: "Forbidden",
      details: "Permission to view plot data denied"
    })
  }

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
