import { db } from "../db"
import { SecureUser } from "../types/user-types"


export const selectUserByUsername = async (authUsername: string, username: string): Promise<SecureUser> => {

  if (authUsername !== username) {
    return Promise.reject({
      status: 403,
      message: "Access to user data denied"
    })
  }

  const result = await db.query(`
    SELECT user_id, username, first_name, surname, unit_preference
    FROM users
    WHERE username = $1
    `,
    [username])

  if (!result.rowCount) {
    return Promise.reject({
      status: 404,
      message: "User not found"
    })
  }

  return result.rows[0]
}


export const updateUserByUsername = async (authUsername: string, username: string, user: SecureUser): Promise<SecureUser> => {

  if (authUsername !== username) {
    return Promise.reject({
      status: 403,
      message: "Permission to edit user data denied"
    })
  }

  const result = await db.query(`
    UPDATE users
    SET first_name = $1, surname = $2, unit_preference = $3
    WHERE username = $4
    RETURNING user_id, username, first_name, surname, unit_preference;
    `,
    [user.first_name, user.surname, user.unit_preference, username])

  if (!result.rowCount) {
    return Promise.reject({
      status: 404,
      message: "User not found"
    })
  }

  return result.rows[0]
}


export const changePasswordByUsername = async (authUsername: string, username: string, password: string): Promise<SecureUser> => {

  if (authUsername !== username) {
    return Promise.reject({
      status: 403,
      message: "Permission to change password denied"
    })
  }

  const result = await db.query(`
    UPDATE users
    SET password = $1
    WHERE username = $2
    RETURNING user_id, username, first_name, surname, unit_preference;
    `,
    [password, username])

  if (!result.rowCount) {
    return Promise.reject({
      status: 404,
      message: "User not found"
    })
  }

  return result.rows[0]
}


export const removeUserByUsername = async (authUsername: string, username: string): Promise<undefined> => {

  if (authUsername !== username) {
    return Promise.reject({
      status: 403,
      message: "Permission to delete user data denied"
    })
  }

  const result = await db.query(`
    DELETE FROM users
    WHERE username = $1
    RETURNING *;
    `,
    [username])

  if (!result.rowCount) {
    return Promise.reject({
      status: 404,
      message: "User not found"
    })
  }
}
