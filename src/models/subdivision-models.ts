import { db } from "../db"
import { getPlotOwnerId } from "../utils/db-query-utils"
import { verifyPermission } from "../utils/verification-utils"


export const selectSubdivisionsByPlotId = async (authUserId: number, plot_id: number) => {

  if (isNaN(plot_id)) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "Plot not found"
    })
  }

  const owner_id = await getPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id, "Permission to view plot subdivision data denied")

  const result = await db.query(`
    SELECT * FROM subdivisions
    WHERE plot_id = $1
    `,
    [plot_id])

  return result.rows
}
