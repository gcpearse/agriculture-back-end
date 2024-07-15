import { db } from "../db"
import { SecureUser } from "../types/user-types"
import { verifyPermission, verifyResult } from "../utils/verification-utils"


export const selectUserByUsername = async (authUsername: string, username: string): Promise<SecureUser> => {

  await verifyPermission(authUsername, username, "Permission to view user data denied")

  const result = await db.query(`
    SELECT user_id, username, first_name, surname, unit_preference
    FROM users
    WHERE username = $1;
    `,
    [username])

  await verifyResult(!result.rowCount, "User not found")

  return result.rows[0]
}


export const updateUserByUsername = async (authUsername: string, username: string, user: SecureUser): Promise<SecureUser> => {

  await verifyPermission(authUsername, username, "Permission to edit user data denied")

  const result = await db.query(`
    UPDATE users
    SET first_name = $1, surname = $2, unit_preference = $3
    WHERE username = $4
    RETURNING user_id, username, first_name, surname, unit_preference;
    `,
    [user.first_name, user.surname, user.unit_preference, username])

  await verifyResult(!result.rowCount, "User not found")

  return result.rows[0]
}


export const changePasswordByUsername = async (authUsername: string, username: string, password: string): Promise<SecureUser> => {

  await verifyPermission(authUsername, username, "Permission to edit password denied")

  const result = await db.query(`
    UPDATE users
    SET password = $1
    WHERE username = $2
    RETURNING user_id, username, first_name, surname, unit_preference;
    `,
    [password, username])

  await verifyResult(!result.rowCount, "User not found")

  return result.rows[0]
}


export const removeUserByUsername = async (authUsername: string, username: string): Promise<undefined> => {

  await verifyPermission(authUsername, username, "Permission to delete user data denied")

  const result = await db.query(`
    DELETE FROM users
    WHERE username = $1
    RETURNING *;
    `,
    [username])

  await verifyResult(!result.rowCount, "User not found")
}
