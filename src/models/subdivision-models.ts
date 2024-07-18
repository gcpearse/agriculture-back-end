import QueryString from "qs"
import { db } from "../db"
import { checkSubdivisionNameConflict, getPlotOwnerId, getSubdivisionPlotId, validateSubdivisionType } from "../utils/db-query-utils"
import { verifyPermission, verifyQueryParamIsNumber } from "../utils/verification-utils"
import { Subdivision } from "../types/subdivision-types"
import format from "pg-format"


export const selectSubdivisionsByPlotId = async (authUserId: number, plot_id: number, { type }: QueryString.ParsedQs): Promise<Subdivision[]> => {

  await verifyQueryParamIsNumber(plot_id, "Plot not found")

  const owner_id = await getPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id, "Permission to view plot subdivision data denied")

  let query = `
  SELECT * FROM subdivisions
  WHERE plot_id = $1
  `

  const isValidSubdivisionType = await validateSubdivisionType(type as string)

  if (type && !isValidSubdivisionType) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "No results found for that query"
    })
  }

  if (type) query += format(`AND type = %L;`, type)

  const result = await db.query(query, [plot_id])

  return result.rows
}


export const insertSubdivisionByPlotId = async (authUserId: number, plot_id: number, subdivision: Subdivision): Promise<Subdivision> => {

  await verifyQueryParamIsNumber(plot_id, "Plot not found")

  let owner_id = await getPlotOwnerId(plot_id)

  await verifyPermission(authUserId, owner_id, "Permission to create subdivision denied")

  owner_id = await getPlotOwnerId(subdivision.plot_id)

  await verifyPermission(authUserId, owner_id, "Permission to create subdivision denied")

  await checkSubdivisionNameConflict(plot_id, subdivision.name)

  const isValidSubdivisionType = await validateSubdivisionType(subdivision.type as string)

  if (!isValidSubdivisionType) {
    return Promise.reject({
      status: 400,
      message: "Bad Request",
      details: "Invalid subdivision type"
    })
  }

  const result = await db.query(`
    INSERT INTO subdivisions
      (plot_id, name, type, description, area)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING *;
    `,
    [subdivision.plot_id, subdivision.name, subdivision.type, subdivision.description, subdivision.area])

  return result.rows[0]
}


export const selectSubdivisionBySubdivisionId = async (authUserId: number, subdivision_id: number): Promise<Subdivision> => {

  await verifyQueryParamIsNumber(subdivision_id, "Subdivision not found")

  const plotId = await getSubdivisionPlotId(subdivision_id)

  const owner_id = await getPlotOwnerId(plotId)

  await verifyPermission(authUserId, owner_id, "Permission to view subdivision data denied")

  const result = await db.query(`
    SELECT * FROM subdivisions
    WHERE subdivision_id = $1;
    `,
    [subdivision_id])

  return result.rows[0]
}


export const updateSubdivisionBySubdivisionId = async (authUserId: number, subdivision_id: number, subdivision: Subdivision): Promise<Subdivision> => {

  await verifyQueryParamIsNumber(subdivision_id, "Subdivision not found")

  const plotId = await getSubdivisionPlotId(subdivision_id)

  const owner_id = await getPlotOwnerId(plotId)

  await verifyPermission(authUserId, owner_id, "Permission to edit subdivision data denied")

  const currentSubdivisionName = await db.query(`
    SELECT name
    FROM subdivisions
    WHERE subdivision_id = $1;
    `,
    [subdivision_id])

  if (currentSubdivisionName.rows[0].name !== subdivision.name) {
    await checkSubdivisionNameConflict(plotId, subdivision.name)
  }

  const isValidSubdivisionType = await validateSubdivisionType(subdivision.type)

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
    [subdivision.name, subdivision.type, subdivision.description, subdivision.area, subdivision_id])

  return result.rows[0]
}


export const removeSubdivisionBySubdivisionId = async (authUserId: number, subdivision_id: number): Promise<void> => {

  await verifyQueryParamIsNumber(subdivision_id, "Subdivision not found")

  const plotId = await getSubdivisionPlotId(subdivision_id)

  const owner_id = await getPlotOwnerId(plotId)

  await verifyPermission(authUserId, owner_id, "Permission to delete subdivision data denied")

  await db.query(`
    DELETE FROM subdivisions
    WHERE subdivision_id = $1
    RETURNING *;
    `,
    [subdivision_id])
}
