import { db } from "../db"


export const checkEmailConflict = async (
  email: string
): Promise<undefined> => {

  const dbEmail = await db.query(`
    SELECT email 
    FROM users
    WHERE email = $1;
    `,
    [email])

  if (dbEmail.rowCount) {
    return Promise.reject({
      status: 409,
      message: "Conflict",
      details: "Email already exists"
    })
  }
}


export const checkPlotNameConflict = async (
  owner_id: number,
  name: string
): Promise<undefined> => {

  const result = await db.query(`
    SELECT name
    FROM plots
    WHERE owner_id = $1;
    `,
    [owner_id])

  if (result.rows.map(row => row.name).includes(name)) {
    return Promise.reject({
      status: 409,
      message: "Conflict",
      details: "Plot name already exists"
    })
  }
}


export const checkSubdivisionNameConflict = async (
  plot_id: number,
  name: string
): Promise<undefined> => {

  const result = await db.query(`
    SELECT name
    FROM subdivisions
    WHERE plot_id = $1;
    `,
    [plot_id])

  if (result.rows.map(row => row.name).includes(name)) {
    return Promise.reject({
      status: 409,
      message: "Conflict",
      details: "Subdivision name already exists"
    })
  }
}


export const getCropOwnerId = async (
  crop_id: number
): Promise<number> => {

  const result = await db.query(`
    SELECT owner_id
    FROM plots
    JOIN crops
    ON plots.plot_id = crops.plot_id
    WHERE crop_id = $1;
    `,
    [crop_id])

  if (!result.rowCount) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "Crop not found"
    })
  }

  return result.rows[0].owner_id
}


export const getPlotOwnerId = async (
  plot_id: number
): Promise<number> => {

  const result = await db.query(`
    SELECT owner_id
    FROM plots
    WHERE plot_id = $1;
    `,
    [plot_id])

  if (!result.rowCount) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "Plot not found"
    })
  }

  return result.rows[0].owner_id
}


export const getSubdivisionPlotId = async (
  subdivision_id: number
): Promise<number> => {

  const result = await db.query(`
    SELECT plot_id
    FROM subdivisions
    WHERE subdivision_id = $1;
    `,
    [subdivision_id])

  if (!result.rowCount) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "Subdivision not found"
    })
  }

  return result.rows[0].plot_id
}


export const searchForUserId = async (
  owner_id: number
): Promise<undefined> => {

  const result = await db.query(`
    SELECT user_id
    FROM users;
    `)

  if (!result.rows.map(row => row.user_id).includes(owner_id)) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "User not found"
    })
  }
}


export const searchForUsername = async (
  username: string
): Promise<undefined> => {

  const result = await db.query(`
    SELECT username
    FROM users;
    `)

  if (!result.rows.map(row => row.username).includes(username)) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "User not found"
    })
  }
}


export const validateCropCategory = async (
  category: string,
  ignoreCase: boolean
): Promise<boolean> => {

  const result = await db.query(`
    SELECT category 
    FROM crop_categories
    WHERE category ${ignoreCase ? "ILIKE" : "="} $1;
    `,
    [category])

  return Boolean(result.rows.length)
}


export const validatePlotType = async (
  type: string,
  ignoreCase: boolean
): Promise<boolean> => {

  const result = await db.query(`
    SELECT type 
    FROM plot_types
    WHERE type ${ignoreCase ? "ILIKE" : "="} $1;
    `,
    [type])

  return Boolean(result.rows.length)
}


export const validateSubdivisionType = async (
  type: string,
  ignoreCase: boolean
): Promise<boolean> => {

  const result = await db.query(`
    SELECT type 
    FROM subdivision_types
    WHERE type ${ignoreCase ? "ILIKE" : "="} $1;
    `,
    [type])

  return Boolean(result.rows.length)
}
