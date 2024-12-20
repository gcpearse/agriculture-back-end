import QueryString from "qs"
import { db } from "../db"
import { ExtendedIssue, Issue, IssueRequest } from "../types/issue-types"
import { fetchIssueOwnerId, fetchPlotOwnerId, fetchSubdivisionPlotId } from "../utils/db-queries"
import { verifyBooleanValue, verifyPagination, verifyPermission, verifyQueryValue, verifyValueIsPositiveInt } from "../utils/verification"
import format from "pg-format"
import { QueryResult } from "pg"
import { Count } from "../types/aggregation-types"


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

  const result: QueryResult<ExtendedIssue> = await db.query(query, [plot_id])

  await verifyPagination(+page, result.rows.length)

  const countResult: QueryResult<Count> = await db.query(countQuery, [plot_id])

  return Promise.all([result.rows, countResult.rows[0].count])
}


export const insertIssueByPlotId = async (
  authUserId: number,
  plot_id: number,
  issue: IssueRequest
): Promise<Issue> => {

  await verifyValueIsPositiveInt(plot_id)

  const owner_id = await fetchPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id)

  const result: QueryResult<Issue> = await db.query(format(`
    INSERT INTO issues (
      plot_id,
      title,
      description,
      is_critical
    )
    VALUES
      %L
    RETURNING *;
    `,
    [[
      plot_id,
      issue.title,
      issue.description,
      issue.is_critical ?? false
    ]]
  ))

  return result.rows[0]
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

  const result: QueryResult<ExtendedIssue> = await db.query(query, [subdivision_id])

  await verifyPagination(+page, result.rows.length)

  const countResult: QueryResult<Count> = await db.query(countQuery, [subdivision_id])

  return Promise.all([result.rows, countResult.rows[0].count])
}


export const insertIssueBySubdivisionId = async (
  authUserId: number,
  subdivision_id: number,
  issue: IssueRequest
): Promise<Issue> => {

  await verifyValueIsPositiveInt(subdivision_id)

  const plot_id = await fetchSubdivisionPlotId(subdivision_id)

  const owner_id = await fetchPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id)

  const result: QueryResult<Issue> = await db.query(format(`
    INSERT INTO issues (
      plot_id,
      subdivision_id,
      title,
      description,
      is_critical
    )
    VALUES
      %L
    RETURNING *;
    `,
    [[
      plot_id,
      subdivision_id,
      issue.title,
      issue.description,
      issue.is_critical ?? false
    ]]
  ))

  return result.rows[0]
}


export const selectIssueByIssueId = async (
  authUserId: number,
  issue_id: number
): Promise<ExtendedIssue> => {

  await verifyValueIsPositiveInt(issue_id)

  const owner_id = await fetchIssueOwnerId(issue_id)

  await verifyPermission(authUserId, owner_id)

  const result: QueryResult<ExtendedIssue> = await db.query(`
    SELECT
      issues.*,
      plots.name
      AS plot_name,
      subdivisions.name
      AS subdivision_name,
      COUNT(DISTINCT issue_notes.note_id)::INT
      AS note_count,
      COUNT(DISTINCT issue_images.image_id)::INT
      AS image_count
    FROM issues
    LEFT JOIN plots
    ON issues.plot_id = plots.plot_id
    LEFT JOIN subdivisions
    ON issues.subdivision_id = subdivisions.subdivision_id
    LEFT JOIN issue_notes
    ON issues.issue_id = issue_notes.issue_id
    LEFT JOIN issue_images
    ON issues.issue_id = issue_images.issue_id
    WHERE issues.issue_id = $1
    GROUP BY issues.issue_id, plots.name, subdivisions.name;
    `,
    [issue_id]
  )

  return result.rows[0]
}


export const updateIssueByIssueId = async (
  authUserId: number,
  issue_id: number,
  issue: IssueRequest
): Promise<Issue> => {

  await verifyValueIsPositiveInt(issue_id)

  const owner_id = await fetchIssueOwnerId(issue_id)

  await verifyPermission(authUserId, owner_id)

  const result: QueryResult<Issue> = await db.query(`
    UPDATE issues
    SET
      title = $1,
      description = $2,
      is_critical = $3
    WHERE issue_id = $4
    RETURNING *;
    `,
    [
      issue.title,
      issue.description,
      issue.is_critical,
      issue_id
    ]
  )

  return result.rows[0]
}


export const removeIssueByIssueId = async (
  authUserId: number,
  issue_id: number
) => {

  await verifyValueIsPositiveInt(issue_id)

  const owner_id = await fetchIssueOwnerId(issue_id)

  await verifyPermission(authUserId, owner_id)

  await db.query(`
    DELETE FROM issues
    WHERE issue_id = $1;
    `,
    [issue_id]
  )
}


export const setIsResolvedByIssueId = async (
  authUserId: number,
  issue_id: number,
  toggle: { isResolved: boolean }
): Promise<Issue> => {

  await verifyValueIsPositiveInt(issue_id)

  const owner_id = await fetchIssueOwnerId(issue_id)

  await verifyPermission(authUserId, owner_id)

  await verifyBooleanValue(toggle.isResolved, true)

  const result: QueryResult<Issue> = await db.query(`
    UPDATE issues
    SET
      is_critical = FALSE,
      is_resolved = TRUE
    WHERE issue_id = $1
    AND is_resolved = FALSE
    RETURNING *;
    `,
    [issue_id]
  )

  if (!result.rows[0]) {
    return Promise.reject({
      status: 400,
      message: "Bad Request",
      details: "Issue already resolved"
    })
  }

  return result.rows[0]
}


export const unsetIsResolvedByIssueId = async (
  authUserId: number,
  issue_id: number,
  toggle: { isResolved: boolean }
): Promise<Issue> => {

  await verifyValueIsPositiveInt(issue_id)

  const owner_id = await fetchIssueOwnerId(issue_id)

  await verifyPermission(authUserId, owner_id)

  await verifyBooleanValue(toggle.isResolved, false)

  const result: QueryResult<Issue> = await db.query(`
    UPDATE issues
    SET
      is_resolved = FALSE
    WHERE issue_id = $1
    AND is_resolved = TRUE
    RETURNING *;
    `,
    [issue_id]
  )

  if (!result.rows[0]) {
    return Promise.reject({
      status: 400,
      message: "Bad Request",
      details: "Issue already unresolved"
    })
  }

  return result.rows[0]
}
