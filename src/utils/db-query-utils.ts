import { db } from "../db"
import { Plot } from "../types/plot-types"


export const getValidPlotTypes = async (owner_id: number): Promise<string[]> => {

  const result = await db.query(`
    SELECT DISTINCT type
    FROM plots
    WHERE owner_id = $1
    `,
    [owner_id])

  return result.rows.map(row => row.type)
}


export const checkPlotNameConflict = async (owner_id: number, name: string): Promise<undefined> => {

  const result = await db.query(`
    SELECT name
    FROM plots
    WHERE owner_id = $1
    `,
    [owner_id])

  const isConflict = result.rows.map(row => row.name).includes(name)

  if (isConflict) {
    return Promise.reject({
      status: 409,
      message: "Conflict",
      details: "Plot name already exists"
    })
  }
}


export const verifyPlotOwner = async (plot_id: number, owner_id: number, details: string): Promise<Plot> => {

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
      details
    })
  }

  return result.rows[0]
}
