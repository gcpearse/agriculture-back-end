import { db } from "../db"


export const getValidPlotTypes = async (owner_id: number): Promise<string[]> => {

  const result = await db.query(`
    SELECT DISTINCT type
    FROM plots
    WHERE owner_id = $1
    `,
    [owner_id])

  return result.rows.map(row => row.type)
}


export const checkPlotNameConflict = async (owner_id: number, name: string) => {

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
