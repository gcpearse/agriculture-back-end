import { db } from "../db"
import { Credentials, LoggedInUser, SecureUser, User } from "../types/user-types"
import { verifyResult } from "../utils/verification-utils"


export const registerUser = async ({ username, password, email, first_name, surname, unit_preference }: User): Promise<SecureUser> => {

  const dbUsername = await db.query(`
    SELECT username 
    FROM users 
    WHERE username = $1;
    `,
    [username])

  const dbEmail = await db.query(`
    SELECT email 
    FROM users 
    WHERE email = $1;
    `,
    [email])

  if (dbUsername.rowCount) {
    return Promise.reject({
      status: 409,
      message: "Conflict",
      details: "Username already exists"
    })
  }

  if (dbEmail.rowCount) {
    return Promise.reject({
      status: 409,
      message: "Conflict",
      details: "Email already exists"
    })
  }

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

  await verifyResult(!result.rowCount, "Username could not be found")

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
