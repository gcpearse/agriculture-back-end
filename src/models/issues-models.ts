import { db } from "../db"
import { ExtendedIssue } from "../types/issue-types"
import { fetchPlotOwnerId } from "../utils/db-queries"
import { verifyPermission, verifyValueIsPositiveInt } from "../utils/verification"


export const selectIssuesByPlotId = async (
  authUserId: number,
  plot_id: number
): Promise<ExtendedIssue[]> => {

  await verifyValueIsPositiveInt(plot_id)

  const owner_id = await fetchPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id)

  let query = `
  SELECT
    issues.*,
    subdivisions.name
    AS subdivision_name,
    COUNT(DISTINCT issue_notes.note_id)::INT
    AS note_count,
    COUNT(DISTINCT issue_images.image_id)::INT
    AS image_count
  FROM issues
  LEFT JOIN subdivisions
  ON issues.subdivision_id = subdivisions.subdivision_id
  LEFT JOIN issue_notes
  ON issues.issue_id = issue_notes.issue_id
  LEFT JOIN issue_images
  ON issues.issue_id = issue_images.issue_id
  WHERE issues.plot_id = $1
  GROUP BY issues.issue_id, subdivisions.name
  ORDER BY issues.issue_id DESC, issues.title;
  `

  const result = await db.query(`${query};`, [plot_id])

  return result.rows
}
