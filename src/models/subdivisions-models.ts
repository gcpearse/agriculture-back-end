import QueryString from "qs"
import { db } from "../db"
import { checkSubdivisionNameConflict, getPlotOwnerId, getSubdivisionPlotId, validateSubdivisionType } from "../utils/db-queries"
import { verifyPermission, verifyValueIsPositiveInt, verifyQueryValue, verifyPagination } from "../utils/verification"
import { ExtendedSubdivision, Subdivision, SubdivisionRequest } from "../types/subdivision-types"
import format from "pg-format"


export const selectSubdivisionsByPlotId = async (
  authUserId: number,
  plot_id: number,
  {
    name,
    type,
    sort = "subdivision_id",
    order = "desc",
    limit = "10",
    page = "1"
  }: QueryString.ParsedQs
): Promise<[ExtendedSubdivision[], number]> => {

  await verifyValueIsPositiveInt(plot_id)

  await verifyValueIsPositiveInt(+limit)

  await verifyValueIsPositiveInt(+page)

  const owner_id = await getPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id)

  await verifyQueryValue(["subdivision_id", "name"], sort as string)

  await verifyQueryValue(["asc", "desc"], order as string)

  const isValidSubdivisionType = await validateSubdivisionType(type as string, true)

  if (type && !isValidSubdivisionType) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "No results found for that query"
    })
  }

  let query = `
  SELECT
    subdivisions.*,
    COUNT(DISTINCT subdivision_images.image_id)::INT
    AS image_count,
    COUNT(DISTINCT crops.crop_id)::INT
    AS crop_count,
    COUNT(DISTINCT issues.issue_id)::INT
    AS issue_count,
    COUNT(DISTINCT jobs.job_id)::INT
    AS job_count
  FROM subdivisions
  LEFT JOIN subdivision_images
  ON subdivisions.subdivision_id = subdivision_images.subdivision_id
  LEFT JOIN crops
  ON subdivisions.subdivision_id = crops.subdivision_id
  LEFT JOIN issues
  ON subdivisions.subdivision_id = issues.subdivision_id
  LEFT JOIN jobs
  ON subdivisions.subdivision_id = jobs.subdivision_id
  WHERE subdivisions.plot_id = $1
  `

  let countQuery = `
  SELECT COUNT(subdivision_id)::INT
  FROM subdivisions
  WHERE plot_id = $1
  `

  if (name) {
    query += format(`
      AND subdivisions.name ILIKE %L
      `, `%${name}%`)
    countQuery += format(`
      AND subdivisions.name ILIKE %L
      `, `%${name}%`)
  }

  if (type) {
    query += format(`
      AND subdivisions.type ILIKE %L
      `, type)
    countQuery += format(`
      AND subdivisions.type ILIKE %L
      `, type)
  }

  query += `
  GROUP BY subdivisions.subdivision_id
  `

  if (sort === "name") {
    order = "asc"
  }

  query += `
  ORDER BY ${sort} ${order}, subdivisions.name
  LIMIT ${limit}
  OFFSET ${(+page - 1) * +limit}
  `

  const result = await db.query(`${query};`, [plot_id])

  await verifyPagination(+page, result.rows.length)

  const countResult = await db.query(`${countQuery};`, [plot_id])

  return Promise.all([result.rows, countResult.rows[0].count])
}


export const insertSubdivisionByPlotId = async (
  authUserId: number,
  plot_id: number,
  subdivision: SubdivisionRequest
): Promise<Subdivision> => {

  await verifyValueIsPositiveInt(plot_id)

  const owner_id = await getPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id)

  await checkSubdivisionNameConflict(plot_id, subdivision.name)

  const isValidSubdivisionType = await validateSubdivisionType(subdivision.type as string, false)

  if (!isValidSubdivisionType) {
    return Promise.reject({
      status: 400,
      message: "Bad Request",
      details: "Invalid subdivision type"
    })
  }

  const result = await db.query(format(`
    INSERT INTO subdivisions (
      plot_id, 
      name, 
      type, 
      description, 
      area
    )
    VALUES
      %L
    RETURNING *;
    `,
    [[
      plot_id,
      subdivision.name,
      subdivision.type,
      subdivision.description,
      subdivision.area
    ]]
  ))

  return result.rows[0]
}


export const selectSubdivisionBySubdivisionId = async (
  authUserId: number,
  subdivision_id: number
): Promise<ExtendedSubdivision> => {

  await verifyValueIsPositiveInt(subdivision_id)

  const plot_id = await getSubdivisionPlotId(subdivision_id)

  const owner_id = await getPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id)

  const result = await db.query(`
    SELECT
      subdivisions.*,
      plots.name
      AS plot_name,
      COUNT(DISTINCT subdivision_images.image_id)::INT
      AS image_count,
      COUNT(DISTINCT crops.crop_id)::INT
      AS crop_count,
      COUNT(DISTINCT issues.issue_id)::INT
      AS issue_count,
      COUNT(DISTINCT jobs.job_id)::INT
      AS job_count
    FROM subdivisions
    LEFT JOIN plots
    ON subdivisions.plot_id = plots.plot_id
    LEFT JOIN subdivision_images
    ON subdivisions.subdivision_id = subdivision_images.subdivision_id
    LEFT JOIN crops
    ON subdivisions.subdivision_id = crops.subdivision_id
    LEFT JOIN issues
    ON subdivisions.subdivision_id = issues.subdivision_id
    LEFT JOIN jobs
    ON subdivisions.subdivision_id = jobs.subdivision_id
    WHERE subdivisions.subdivision_id = $1
    GROUP BY subdivisions.subdivision_id, plots.name;
    `,
    [subdivision_id]
  )

  return result.rows[0]
}


export const updateSubdivisionBySubdivisionId = async (
  authUserId: number,
  subdivision_id: number,
  subdivision: SubdivisionRequest
): Promise<Subdivision> => {

  await verifyValueIsPositiveInt(subdivision_id)

  const plot_id = await getSubdivisionPlotId(subdivision_id)

  const owner_id = await getPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id)

  const currentSubdivisionName = await db.query(`
    SELECT name
    FROM subdivisions
    WHERE subdivision_id = $1;
    `,
    [subdivision_id]
  )

  if (currentSubdivisionName.rows[0].name !== subdivision.name) {
    await checkSubdivisionNameConflict(plot_id, subdivision.name)
  }

  const isValidSubdivisionType = await validateSubdivisionType(subdivision.type, false)

  if (!isValidSubdivisionType) {
    return Promise.reject({
      status: 400,
      message: "Bad Request",
      details: "Invalid subdivision type"
    })
  }

  const result = await db.query(`
    UPDATE subdivisions
    SET
      name = $1,
      type = $2,
      description = $3,
      area = $4
    WHERE subdivision_id = $5
    RETURNING *;
    `,
    [
      subdivision.name,
      subdivision.type,
      subdivision.description,
      subdivision.area,
      subdivision_id
    ]
  )

  return result.rows[0]
}


export const removeSubdivisionBySubdivisionId = async (
  authUserId: number,
  subdivision_id: number
): Promise<void> => {

  await verifyValueIsPositiveInt(subdivision_id)

  const plot_id = await getSubdivisionPlotId(subdivision_id)

  const owner_id = await getPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id)

  await db.query(`
    DELETE FROM subdivisions
    WHERE subdivision_id = $1;
    `,
    [subdivision_id]
  )
}
