import { db } from "../db"
import { Credentials, LoggedInUser, SecureUser, User } from "../types/user-types"
import { checkEmailConflict } from "../utils/db-query-utils"


export const registerUser = async ({ username, password, email, first_name, surname, unit_preference }: User): Promise<SecureUser> => {

  const dbUsername = await db.query(`
    SELECT username 
    FROM users 
    WHERE username = $1;
    `,
    [username])

  if (dbUsername.rowCount) {
    return Promise.reject({
      status: 409,
      message: "Conflict",
      details: "Username already exists"
    })
  }

  await checkEmailConflict(email)

  const result = await db.query(`
    INSERT INTO users
      (username, password, email, first_name, surname, unit_preference)
    VALUES
      ($1, $2, $3, $4, $5, $6)
    RETURNING 
      user_id, 
      username,
      email, 
      first_name, 
      surname, 
      unit_preference;
    `,
    [username, password, email, first_name, surname, unit_preference]
  )

  return result.rows[0]
}


export const logInUser = async ({ username, password }: Credentials): Promise<LoggedInUser> => {

  const result = await db.query(`
    SELECT 
      user_id, 
      username 
    FROM users 
    WHERE username = $1;
    `,
    [username])

  if (!result.rowCount) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "Username could not be found"
    })
  }

  const dbPassword = await db.query(`
    SELECT password
    FROM users
    WHERE username = $1
    AND password = $2;
    `,
    [username, password])

  if (!dbPassword.rowCount) {
    return Promise.reject({
      status: 401,
      message: "Unauthorized",
      details: "Incorrect password"
    })
  }

  return result.rows[0]
}
