import { db } from "../db"
import { Issue } from "../types/issue-types"
import { fetchPlotOwnerId } from "../utils/db-queries"
import { verifyPermission, verifyValueIsPositiveInt } from "../utils/verification"


export const selectIssuesByPlotId = async (
  authUserId: number,
  plot_id: number
): Promise<Issue[]> => {

  await verifyValueIsPositiveInt(plot_id)

  const owner_id = await fetchPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id)

  let query = `
  SELECT *
  FROM issues
  WHERE issues.plot_id = $1
  ORDER BY issues.issue_id DESC, issues.title;
  `

  const result = await db.query(`${query};`, [plot_id])

  return result.rows
}
