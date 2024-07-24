import { db } from "../db"
import { compareHash, generateHash } from "../middleware/security"
import { PasswordUpdate, SecureUser } from "../types/user-types"
import { checkEmailConflict, searchForUsername } from "../utils/db-query-utils"
import { verifyPermission } from "../utils/verification-utils"


export const selectUserByUsername = async (
  authUsername: string,
  username: string
): Promise<SecureUser> => {

  await searchForUsername(username)

  await verifyPermission(authUsername, username, "Permission to view user data denied")

  const result = await db.query(`
    SELECT 
      user_id, 
      username, 
      email,
      first_name, 
      surname, 
      unit_preference
    FROM users
    WHERE username = $1;
    `,
    [username])

  return result.rows[0]
}


export const updateUserByUsername = async (
  authUsername: string,
  username: string,
  user: SecureUser
): Promise<SecureUser> => {

  await searchForUsername(username)

  await verifyPermission(authUsername, username, "Permission to edit user data denied")

  await checkEmailConflict(user.email)

  const result = await db.query(`
    UPDATE users
    SET 
      email = $1,
      first_name = $2, 
      surname = $3, 
      unit_preference = $4
    WHERE username = $5
    RETURNING 
      user_id, 
      username, 
      email,
      first_name, 
      surname, 
      unit_preference;
    `,
    [user.email, user.first_name, user.surname, user.unit_preference, username])

  return result.rows[0]
}


export const removeUserByUsername = async (
  authUsername: string,
  username: string
): Promise<void> => {

  await searchForUsername(username)

  await verifyPermission(authUsername, username, "Permission to delete user data denied")

  await db.query(`
    DELETE FROM users
    WHERE username = $1
    RETURNING *;
    `,
    [username])
}


export const updatePasswordByUsername = async (
  authUsername: string,
  username: string,
  {
    oldPassword,
    newPassword
  }: PasswordUpdate
): Promise<{ message: string, details: string }> => {

  await searchForUsername(username)

  await verifyPermission(authUsername, username, "Permission to edit password denied")

  const currentPassword = await db.query(`
    SELECT password
    FROM users
    WHERE username = $1;
    `,
    [username])

  const isCorrectPassword = await compareHash(oldPassword, currentPassword.rows[0].password)

  if (!isCorrectPassword) {
    return Promise.reject({
      status: 401,
      message: "Unauthorized",
      details: "Incorrect password"
    })
  }

  const hashedPassword = await generateHash(newPassword)

  await db.query(`
    UPDATE users
    SET password = $1
    WHERE username = $2
    RETURNING 
      user_id, 
      username, 
      email,
      first_name, 
      surname, 
      unit_preference;
    `,
    [hashedPassword, username])

  return {
    message: "OK",
    details: "Password changed successfully"
  }
}
