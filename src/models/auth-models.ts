import { db } from "../db"
import { Credentials, LoggedInUser, SecureUser, User } from "../types/user-types"


export const registerUser = async ({ username, password, first_name, surname, unit_preference }: User): Promise<SecureUser> => {

  const conflictCheck = await db.query(`
    SELECT username 
    FROM users 
    WHERE username = $1;
    `,
    [username])

  if (conflictCheck.rowCount) {
    return Promise.reject({
      status: 409,
      message: "Conflict",
      details: "Username already exists"
    })
  }

  const result = await db.query(`
    INSERT INTO users
      (username, password, first_name, surname, unit_preference)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING 
      user_id, 
      username, 
      first_name, 
      surname, 
      unit_preference;
    `,
    [username, password, first_name, surname, unit_preference]
  )

  return result.rows[0]
}


export const logInUser = async ({ username, password }: Credentials): Promise<LoggedInUser> => {

  const usernameCheck = await db.query(`
    SELECT 
      user_id, 
      username 
    FROM users 
    WHERE username = $1;
    `,
    [username])

  if (!usernameCheck.rowCount) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "Username could not be found"
    })
  }

  const passwordCheck = await db.query(`
    SELECT password
    FROM users
    WHERE username = $1
    AND password = $2;
    `,
    [username, password])

  if (!passwordCheck.rowCount) {
    return Promise.reject({
      status: 401,
      message: "Unauthorized",
      details: "Incorrect password"
    })
  }

  return usernameCheck.rows[0]
}
