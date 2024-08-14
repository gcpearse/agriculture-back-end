import QueryString from "qs"
import { db } from "../db"
import { compareHash, generateHash } from "../middleware/security"
import { StatusResponse } from "../types/response-types"
import { PasswordUpdate, SecureUser } from "../types/user-types"
import { checkEmailConflict, getUserRole, searchForUserId, validateUnitSystem, validateUserRole } from "../utils/db-queries"
import { verifyPagination, verifyParamIsPositiveInt, verifyPermission, verifyQueryValue } from "../utils/verification"
import format from "pg-format"


export const selectAllUsers = async (
  authUserId: number,
  {
    role,
    unit_system,
    sort = "user_id",
    order = "asc",
    limit = "50",
    page = "1"
  }: QueryString.ParsedQs
): Promise<[SecureUser[], number]> => {

  await verifyParamIsPositiveInt(+limit)

  await verifyParamIsPositiveInt(+page)

  const userRole = await getUserRole(authUserId)

  await verifyPermission(userRole, "admin", "Permission to view user data denied")

  await verifyQueryValue(["user_id", "email", "first_name", "surname"], sort as string)

  await verifyQueryValue(["asc", "desc"], order as string)

  let query = `
  SELECT
    user_id, 
    username, 
    email,
    first_name, 
    surname,
    role,
    unit_system
  FROM users
  WHERE TRUE
  `

  let countQuery = `
  SELECT COUNT(user_id)::INT
  FROM users
  WHERE TRUE
  `

  if (role) {
    await validateUserRole(role as string)

    query += format(`
      AND users.role::VARCHAR ILIKE %L
      `, role)
    countQuery += format(`
      AND users.role::VARCHAR ILIKE %L
      `, role)
  }

  if (unit_system) {
    await validateUnitSystem(unit_system as string)
    
    query += format(`
      AND users.unit_system::VARCHAR ILIKE %L
      `, unit_system)
    countQuery += format(`
      AND users.unit_system::VARCHAR ILIKE %L
      `, unit_system)
  }

  query += `
  ORDER BY ${sort} ${order}
  LIMIT ${limit}
  OFFSET ${(+page - 1) * +limit}
  `

  const result = await db.query(`${query};`)

  await verifyPagination(+page, result.rows.length)

  const countResult = await db.query(`${countQuery};`)

  return Promise.all([result.rows, countResult.rows[0].count])
}


export const selectUserByUserId = async (
  authUserId: number,
  user_id: number
): Promise<SecureUser> => {

  await verifyParamIsPositiveInt(user_id)

  await searchForUserId(user_id)

  await verifyPermission(authUserId, user_id, "Permission to view user data denied")

  const result = await db.query(`
    SELECT 
      user_id, 
      username, 
      email,
      first_name, 
      surname,
      role,
      unit_system
    FROM users
    WHERE user_id = $1;
    `,
    [user_id]
  )

  return result.rows[0]
}


export const updateUserByUserId = async (
  authUserId: number,
  user_id: number,
  user: SecureUser
): Promise<SecureUser> => {

  await verifyParamIsPositiveInt(user_id)

  await searchForUserId(user_id)

  await verifyPermission(authUserId, user_id, "Permission to edit user data denied")

  await checkEmailConflict(user.email)

  const result = await db.query(`
    UPDATE users
    SET 
      email = $1,
      first_name = $2, 
      surname = $3, 
      unit_system = $4
    WHERE user_id = $5
    RETURNING 
      user_id, 
      username, 
      email,
      first_name, 
      surname, 
      role,
      unit_system;
    `,
    [
      user.email,
      user.first_name,
      user.surname,
      user.unit_system,
      user_id
    ]
  )

  return result.rows[0]
}


export const removeUserByUserId = async (
  authUserId: number,
  user_id: number
): Promise<void> => {

  await verifyParamIsPositiveInt(user_id)

  await searchForUserId(user_id)

  await verifyPermission(authUserId, user_id, "Permission to delete user data denied")

  await db.query(`
    DELETE FROM users
    WHERE user_id = $1
    RETURNING *;
    `,
    [user_id]
  )
}


export const updatePasswordByUserId = async (
  authUserId: number,
  user_id: number,
  {
    oldPassword,
    newPassword
  }: PasswordUpdate
): Promise<StatusResponse> => {

  await verifyParamIsPositiveInt(user_id)

  await searchForUserId(user_id)

  await verifyPermission(authUserId, user_id, "Permission to edit password denied")

  if (!newPassword) {
    return Promise.reject({
      status: 400,
      message: "Bad Request",
      details: "Empty string"
    })
  }

  const currentPassword = await db.query(`
    SELECT password
    FROM users
    WHERE user_id = $1;
    `,
    [user_id]
  )

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
    WHERE user_id = $2
    RETURNING 
      user_id, 
      username, 
      email,
      first_name, 
      surname, 
      unit_system;
    `,
    [hashedPassword, user_id]
  )

  return {
    message: "OK",
    details: "Password changed successfully"
  }
}
