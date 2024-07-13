import { db } from "../db"
import { Credentials, User } from "../types"


export const registerUser = async ({ username, password, first_name, surname, uses_metric }: User) => {

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


export const logInUser = async ({ username, password }: Credentials) => {

  const usernameCheck = await db.query(`
    SELECT username 
    FROM users 
    WHERE username = $1
    `,
    [username])

  if (!usernameCheck.rowCount) {
    return Promise.reject({
      status: 404,
      message: "Username not found"
    })
  }

  const passwordCheck = await db.query(`
    SELECT password
    FROM users
    WHERE username = $1
    AND password = $2
    `,
    [username, password])

  if (!passwordCheck.rowCount) {
    return Promise.reject({
      status: 401,
      message: "Incorrect password"
    })
  }

  return usernameCheck.rows[0]
}
