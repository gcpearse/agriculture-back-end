import format from "pg-format"
import { db } from "../db"
import { SecureUser, User } from "../types/user-types"
import { checkEmailConflict } from "../utils/db-queries"
import { generateHash } from "../middleware/security"


export const registerUser = async (
  {
    username,
    password,
    email,
    first_name,
    surname,
    unit_system
  }: User
): Promise<SecureUser> => {

  const dbUsername = await db.query(`
    SELECT username 
    FROM users 
    WHERE username = $1;
    `,
    [username]
  )

  if (dbUsername.rowCount) {
    return Promise.reject({
      status: 409,
      message: "Conflict",
      details: "Username already exists"
    })
  }

  await checkEmailConflict(email)

  const hashedPassword = await generateHash(password)

  const result = await db.query(format(`
    INSERT INTO users
      (username, password, email, first_name, surname, unit_system)
    VALUES
      %L
    RETURNING 
      user_id, 
      username,
      email, 
      first_name, 
      surname,
      role,
      unit_system;
    `,
    [[
      username,
      hashedPassword,
      email,
      first_name,
      surname,
      unit_system
    ]]
  ))

  return result.rows[0]
}
