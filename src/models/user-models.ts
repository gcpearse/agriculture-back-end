import { db } from "../db"
import { User } from "../types"


export const insertUser = async ({ username, password, first_name, surname, uses_metric }: User) => {

  const conflictCheck = await db.query(`
    SELECT username 
    FROM users 
    WHERE username = $1
    `,
    [username])

  if (conflictCheck.rowCount) {
    return Promise.reject({
      status: 409,
      message: "Username already exists"
    })
  }

  const result = await db.query(`
    INSERT INTO users
      (username, password, first_name, surname, uses_metric)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING *;
    `,
    [username, password, first_name, surname, uses_metric]
  )

  return result.rows[0]
}
