import { db } from "../db"
import { Credentials, LoggedInUser } from "../types/user-types"


export const logInUser = async (
  { username, password }: Credentials
): Promise<LoggedInUser> => {

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
