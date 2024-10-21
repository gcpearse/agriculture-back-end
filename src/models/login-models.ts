import { QueryResult } from "pg"
import { db } from "../db"
import { compareHash } from "../middleware/security"
import { Credentials, LoggedInUser, Password } from "../types/user-types"


export const logInUser = async (
  { login, password }: Credentials
): Promise<LoggedInUser> => {

  const result: QueryResult<LoggedInUser> = await db.query(`
    SELECT 
      user_id, 
      username 
    FROM users 
    WHERE username = $1
    OR email = $1;
    `,
    [login]
  )

  if (!result.rowCount) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "Username or email could not be found"
    })
  }

  const passwordResult: QueryResult<Password> = await db.query(`
    SELECT password
    FROM users
    WHERE username = $1
    OR email = $1;
    `,
    [login]
  )

  const isCorrectPassword = await compareHash(
    password,
    passwordResult.rows[0].password
  )

  if (!isCorrectPassword) {
    return Promise.reject({
      status: 401,
      message: "Unauthorized",
      details: "Incorrect password"
    })
  }

  return result.rows[0]
}
