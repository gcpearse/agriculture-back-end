import { db } from "../db"
import { SecureUser, User } from "../types/user-types"
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
