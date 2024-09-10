import { db } from "../db"


export const checkForEmailConflict = async (
  email: string
): Promise<undefined> => {

  const result = await db.query(`
    SELECT email 
    FROM users
    WHERE email = $1;
    `,
    [email]
  )

  if (result.rowCount) {
    return Promise.reject({
      status: 409,
      message: "Conflict",
      details: "Email already exists"
    })
  }
}


export const checkForPlotNameConflict = async (
  owner_id: number,
  name: string
): Promise<undefined> => {

  const result = await db.query(`
    SELECT name
    FROM plots
    WHERE owner_id = $1
    AND name = $2;
    `,
    [owner_id, name]
  )

  if (result.rowCount) {
    return Promise.reject({
      status: 409,
      message: "Conflict",
      details: "Plot name already exists"
    })
  }
}


export const checkForSubdivisionNameConflict = async (
  plot_id: number,
  name: string
): Promise<undefined> => {

  const result = await db.query(`
    SELECT name
    FROM subdivisions
    WHERE plot_id = $1
    AND name = $2;
    `,
    [plot_id, name]
  )

  if (result.rowCount) {
    return Promise.reject({
      status: 409,
      message: "Conflict",
      details: "Subdivision name already exists"
    })
  }
}


export const fetchCropNoteCropId = async (
  note_id: number
): Promise<number> => {

  const result = await db.query(`
    SELECT crop_id
    FROM crop_notes
    WHERE note_id = $1;
    `,
    [note_id]
  )

  if (!result.rowCount) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "Crop note not found"
    })
  }

  return result.rows[0].crop_id
}


export const fetchCropOwnerId = async (
  crop_id: number
): Promise<number> => {

  const result = await db.query(`
    SELECT owner_id
    FROM plots
    JOIN crops
    ON plots.plot_id = crops.plot_id
    WHERE crop_id = $1;
    `,
    [crop_id]
  )

  if (!result.rowCount) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "Crop not found"
    })
  }

  return result.rows[0].owner_id
}


export const fetchPlotOwnerId = async (
  plot_id: number
): Promise<number> => {

  const result = await db.query(`
    SELECT owner_id
    FROM plots
    WHERE plot_id = $1;
    `,
    [plot_id]
  )

  if (!result.rowCount) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "Plot not found"
    })
  }

  return result.rows[0].owner_id
}


export const fetchSubdivisionPlotId = async (
  subdivision_id: number
): Promise<number> => {

  const result = await db.query(`
    SELECT plot_id
    FROM subdivisions
    WHERE subdivision_id = $1;
    `,
    [subdivision_id]
  )

  if (!result.rowCount) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "Subdivision not found"
    })
  }

  return result.rows[0].plot_id
}


export const fetchUserRole = async (
  user_id: number
): Promise<string> => {

  const result = await db.query(`
    SELECT role
    FROM users
    WHERE user_id = $1;
    `,
    [user_id])

  if (!result.rowCount) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "User not found"
    })
  }

  return result.rows[0].role
}


export const searchForUserId = async (
  owner_id: number
): Promise<undefined> => {

  const result = await db.query(`
    SELECT user_id
    FROM users
    WHERE user_id = $1;
    `,
    [owner_id]
  )

  if (!result.rowCount) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "User not found"
    })
  }
}


export const confirmCropCategoryIsValid = async (
  category: string,
  ignoreCase: boolean
): Promise<undefined> => {

  const result = await db.query(`
    SELECT category 
    FROM crop_categories
    WHERE category ${ignoreCase ? "ILIKE" : "="} $1;
    `,
    [category]
  )

  if (!result.rowCount) {
    return Promise.reject({
      status: 400,
      message: "Bad Request",
      details: "Invalid crop category"
    })
  }
}


export const confirmPlotTypeIsValid = async (
  type: string,
  ignoreCase: boolean
): Promise<undefined> => {

  const result = await db.query(`
    SELECT type 
    FROM plot_types
    WHERE type ${ignoreCase ? "ILIKE" : "="} $1;
    `,
    [type]
  )

  if (!result.rowCount) {
    return Promise.reject({
      status: 400,
      message: "Bad Request",
      details: "Invalid plot type"
    })
  }
}


export const confirmSubdivisionTypeIsValid = async (
  type: string,
  ignoreCase: boolean
): Promise<boolean> => {

  const result = await db.query(`
    SELECT type 
    FROM subdivision_types
    WHERE type ${ignoreCase ? "ILIKE" : "="} $1;
    `,
    [type]
  )

  return Boolean(result.rowCount)
}


export const confirmUnitSystemIsValid = async (
  unit_system: string
): Promise<undefined> => {

  const result = await db.query(`
    SELECT *
    FROM unnest(enum_range(null::unit_system))
    AS unit_system
    WHERE unit_system::VARCHAR ILIKE $1;
    `,
    [unit_system])

  if (!result.rowCount) {
    return Promise.reject({
      status: 400,
      message: "Bad Request",
      details: "Invalid unit system"
    })
  }
}


export const confirmUserRoleIsValid = async (
  role: string
): Promise<undefined> => {

  const result = await db.query(`
    SELECT *
    FROM unnest(enum_range(null::user_role))
    AS role
    WHERE role::VARCHAR ILIKE $1;
    `,
    [role])

  if (!result.rowCount) {
    return Promise.reject({
      status: 400,
      message: "Bad Request",
      details: "Invalid user role"
    })
  }
}
