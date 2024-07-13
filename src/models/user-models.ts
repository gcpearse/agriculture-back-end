import { db } from "../db"


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
