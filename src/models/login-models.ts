import { db } from "../db"
import { comparePasswords } from "../middleware/security"
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
    WHERE username = $1;
    `,
    [username])

  const isCorrectPassword = await comparePasswords(password, dbPassword.rows[0].password)

  if (!isCorrectPassword) {
    return Promise.reject({
      status: 401,
      message: "Unauthorized",
      details: "Incorrect password"
    })
  }

  return result.rows[0]
}
