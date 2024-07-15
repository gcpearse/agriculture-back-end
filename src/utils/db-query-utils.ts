import { db } from "../db"


export const getValidPlotTypes = async (owner_id: number): Promise<string[]> => {

  const validTypes = await db.query(`
    SELECT DISTINCT type
    FROM plots
    WHERE owner_id = $1
    `,
    [owner_id])

  return validTypes.rows.map(row => row.type)
}
