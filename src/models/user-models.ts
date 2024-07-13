import { db } from "../db"
import { User } from "../types/user-types"


export const selectUserByUsername = async (authorisedUser: string, username: string) => {

  if (authorisedUser !== username) {
    return Promise.reject({
      status: 403,
      message: "Access to user data denied"
    })
  }

  const result = await db.query(`
    SELECT user_id, username, first_name, surname, uses_metric
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


export const updateUserByUsername = async (authorisedUser: string, username: string, user: User) => {

  if (authorisedUser !== username) {
    return Promise.reject({
      status: 403,
      message: "Permission to edit user data denied"
    })
  }

  const result = await db.query(`
    UPDATE users
    SET first_name = $1, surname = $2, uses_metric = $3
    WHERE username = $4
    RETURNING user_id, username, first_name, surname, uses_metric;
    `,
    [user.first_name, user.surname, user.uses_metric, username])

  if (!result.rowCount) {
    return Promise.reject({
      status: 404,
      message: "User not found"
    })
  }

  return result.rows[0]
}


export const changePasswordByUsername = async (authorisedUser: string, username: string, password: string) => {

  if (authorisedUser !== username) {
    return Promise.reject({
      status: 403,
      message: "Permission to change password denied"
    })
  }

  const result = await db.query(`
    UPDATE users
    SET password = $1
    WHERE username = $2
    RETURNING user_id, username, first_name, surname, uses_metric;
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


export const removeUserByUsername = async (authorisedUser: string, username: string) => {

  if (authorisedUser !== username) {
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
