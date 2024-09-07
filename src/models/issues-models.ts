import QueryString from "qs"
import { db } from "../db"
import { ExtendedIssue } from "../types/issue-types"
import { fetchPlotOwnerId } from "../utils/db-queries"
import { verifyPermission, verifyQueryValue, verifyValueIsPositiveInt } from "../utils/verification"
import format from "pg-format"


export const selectIssuesByPlotId = async (
  authUserId: number,
  plot_id: number,
  {
    is_critical,
    is_resolved,
    sort = "issue_id",
    order,
    limit = "10"
  }: QueryString.ParsedQs
): Promise<ExtendedIssue[]> => {

  await verifyValueIsPositiveInt(plot_id)

  await verifyValueIsPositiveInt(+limit)

  const owner_id = await fetchPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id)

  await verifyQueryValue(["issue_id", "title"], sort as string)

  if (order) {
    await verifyQueryValue(["asc", "desc"], order as string)
  }

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
  `

  if (is_critical) {
    await verifyQueryValue(["true", "false"], is_critical as string)

    query += format(`
      AND issues.is_critical = %L
      `, is_critical)
  }

  if (is_resolved) {
    await verifyQueryValue(["true", "false"], is_resolved as string)

    query += format(`
      AND issues.is_resolved = %L
      `, is_resolved)
  }

  query += `
  GROUP BY issues.issue_id, subdivisions.name
  `

  if (!order) {
    sort === "issue_id" ? order = "desc" : order = "asc"
  }

  query += `
  ORDER BY ${sort} ${order}, issues.title
  LIMIT ${limit}
  `

  const result = await db.query(`${query};`, [plot_id])

  return result.rows
}
