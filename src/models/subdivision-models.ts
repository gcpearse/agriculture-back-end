import { db } from "../db"


export const selectSubdivisionsByPlotId = async (authUserId: number, plot_id: number) => {

  console.log(authUserId, plot_id)

  const result = await db.query(`
    SELECT * FROM subdivisions
    WHERE plot_id = $1
    `,
    [plot_id])

  return result.rows
}
