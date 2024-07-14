import { db } from "../db"


export const selectPlotsByOwner = async (authUserId: number, owner_id: number): Promise<any> => {

  if (authUserId !== owner_id) {
    return Promise.reject({
      status: 403,
      message: "Access to plot data denied"
    })
  }

  const result = await db.query(`
    SELECT * FROM plots
    WHERE owner_id = $1;
    `,
    [owner_id])

  if (!result.rowCount) {
    return Promise.reject({
      status: 404,
      message: "No plots found"
    })
  }

  return result.rows
}
