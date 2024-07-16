import { db } from "../db"


export const checkPlotNameConflict = async (owner_id: number, name: string): Promise<undefined> => {

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


export const validatePlotType = async (type: string): Promise<boolean> => {

  const result = await db.query(`
    SELECT type FROM plot_types;
    `)

  return result.rows.map(row => row.type).includes(type as string)
}


export const getPlotOwnerId = async (plot_id: number): Promise<number> => {

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


export const checkEmailConflict = async (email: string): Promise<undefined> => {

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
