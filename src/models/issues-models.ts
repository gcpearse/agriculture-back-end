import QueryString from "qs"
import { db } from "../db"
import { ExtendedIssue } from "../types/issue-types"
import { fetchPlotOwnerId, fetchSubdivisionPlotId } from "../utils/db-queries"
import { verifyPagination, verifyPermission, verifyQueryValue, verifyValueIsPositiveInt } from "../utils/verification"
import format from "pg-format"


export const selectIssuesByPlotId = async (
  authUserId: number,
  plot_id: number,
  {
    is_critical,
    is_resolved,
    sort = "issue_id",
    order,
    limit = "10",
    page = "1"
  }: QueryString.ParsedQs
): Promise<[ExtendedIssue[], number]> => {

  for (const value of [plot_id, +limit, +page]) {
    await verifyValueIsPositiveInt(value)
  }

  const owner_id = await fetchPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id)

  await verifyQueryValue(["issue_id", "title"], sort as string)

  if (order) {
    await verifyQueryValue(["asc", "desc"], order as string)
  } else {
    sort === "title" ? order = "asc" : order = "desc"
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

  let countQuery = `
  SELECT COUNT(issue_id)::INT
  FROM issues
  WHERE plot_id = $1
  `

  if (is_critical) {
    await verifyQueryValue(["true", "false"], is_critical as string)

    query += format(`
      AND issues.is_critical = %L
      `, is_critical)

    countQuery += format(`
      AND issues.is_critical = %L
      `, is_critical)
  }

  if (is_resolved) {
    await verifyQueryValue(["true", "false"], is_resolved as string)

    query += format(`
      AND issues.is_resolved = %L
      `, is_resolved)

    countQuery += format(`
      AND issues.is_resolved = %L
      `, is_resolved)
  }

  query += format(`
    GROUP BY issues.issue_id, subdivisions.name
    ORDER BY %s %s, issues.title
    LIMIT %L
    OFFSET %L
    `, sort, order, limit, (+page - 1) * +limit)

  const result = await db.query(query, [plot_id])

  await verifyPagination(+page, result.rows.length)

  const countResult = await db.query(countQuery, [plot_id])

  return Promise.all([result.rows, countResult.rows[0].count])
}


export const selectIssuesBySubdivisionId = async (
  authUserId: number,
  subdivision_id: number,
  {
    is_critical,
    is_resolved,
    sort = "issue_id",
    order,
    limit = "10",
    page = "1"
  }: QueryString.ParsedQs
): Promise<[ExtendedIssue[], number]> => {

  for (const value of [subdivision_id, +limit, +page]) {
    await verifyValueIsPositiveInt(value)
  }

  const plot_id = await fetchSubdivisionPlotId(subdivision_id)

  const owner_id = await fetchPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id)

  await verifyQueryValue(["issue_id", "title"], sort as string)

  if (order) {
    await verifyQueryValue(["asc", "desc"], order as string)
  } else {
    sort === "title" ? order = "asc" : order = "desc"
  }

  let query = `
  SELECT
    issues.*,
    COUNT(DISTINCT issue_notes.note_id)::INT
    AS note_count,
    COUNT(DISTINCT issue_images.image_id)::INT
    AS image_count
  FROM issues
  LEFT JOIN issue_notes
  ON issues.issue_id = issue_notes.issue_id
  LEFT JOIN issue_images
  ON issues.issue_id = issue_images.issue_id
  WHERE issues.subdivision_id = $1
  `

  let countQuery = `
  SELECT COUNT(issue_id)::INT
  FROM issues
  WHERE subdivision_id = $1
  `

  if (is_critical) {
    await verifyQueryValue(["true", "false"], is_critical as string)

    query += format(`
      AND issues.is_critical = %L
      `, is_critical)

    countQuery += format(`
      AND issues.is_critical = %L
      `, is_critical)
  }

  if (is_resolved) {
    await verifyQueryValue(["true", "false"], is_resolved as string)

    query += format(`
      AND issues.is_resolved = %L
      `, is_resolved)

    countQuery += format(`
      AND issues.is_resolved = %L
      `, is_resolved)
  }

  query += format(`
    GROUP BY issues.issue_id
    ORDER BY %s %s, issues.title
    LIMIT %L
    OFFSET %L
    `, sort, order, +limit, (+page - 1) * +limit)

  const result = await db.query(query, [subdivision_id])

  await verifyPagination(+page, result.rows.length)

  const countResult = await db.query(countQuery, [subdivision_id])

  return Promise.all([result.rows, countResult.rows[0].count])
}
