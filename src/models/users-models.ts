import QueryString from "qs"
import { db } from "../db"
import { compareHash, generateHash } from "../middleware/security"
import { StatusResponse } from "../types/response-types"
import { PasswordUpdate, SecureUser, UserRequest, UserRole } from "../types/user-types"
import { checkForEmailConflict, fetchUserRole, searchForUserId, confirmUnitSystemIsValid, confirmUserRoleIsValid } from "../utils/db-queries"
import { verifyPagination, verifyValueIsPositiveInt, verifyPermission, verifyQueryValue, verifyPasswordFormat } from "../utils/verification"
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

  for (const value of [+limit, +page]) {
    await verifyValueIsPositiveInt(value)
  }

  const userRole = await fetchUserRole(authUserId)

  await verifyPermission(userRole, UserRole.Admin)

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
    await confirmUserRoleIsValid(role as string)

    query += format(`
      AND users.role::VARCHAR ILIKE %L
      `, role)

    countQuery += format(`
      AND users.role::VARCHAR ILIKE %L
      `, role)
  }

  if (unit_system) {
    await confirmUnitSystemIsValid(unit_system as string)

    query += format(`
      AND users.unit_system::VARCHAR ILIKE %L
      `, unit_system)

    countQuery += format(`
      AND users.unit_system::VARCHAR ILIKE %L
      `, unit_system)
  }

  query += format(`
    ORDER BY %s %s
    LIMIT %L
    OFFSET %L
    `, sort, order, limit, (+page - 1) * +limit)

  const result = await db.query(query)

  await verifyPagination(+page, result.rows.length)

  const countResult = await db.query(countQuery)

  return Promise.all([result.rows, countResult.rows[0].count])
}


export const selectUserByUserId = async (
  authUserId: number,
  user_id: number
): Promise<SecureUser> => {

  await verifyValueIsPositiveInt(user_id)

  await searchForUserId(user_id)

  const userRole = await fetchUserRole(authUserId)

  if (userRole !== UserRole.Admin) {
    await verifyPermission(authUserId, user_id)
  }

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
  user: UserRequest
): Promise<SecureUser> => {

  await verifyValueIsPositiveInt(user_id)

  await searchForUserId(user_id)

  await verifyPermission(authUserId, user_id)

  await checkForEmailConflict(user.email, user_id)

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

  await verifyValueIsPositiveInt(user_id)

  await searchForUserId(user_id)

  await verifyPermission(authUserId, user_id)

  await db.query(`
    DELETE FROM users
    WHERE user_id = $1;
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

  await verifyValueIsPositiveInt(user_id)

  await searchForUserId(user_id)

  await verifyPermission(authUserId, user_id)

  await verifyPasswordFormat(newPassword)

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

  // Compare values once old password has been verified
  if (oldPassword === newPassword) {
    return Promise.reject({
      status: 409,
      message: "Conflict",
      details: "Old and new password values cannot be equal"
    })
  }

  const hashedPassword = await generateHash(newPassword)

  await db.query(`
    UPDATE users
    SET password = $1
    WHERE user_id = $2
    `,
    [hashedPassword, user_id]
  )

  return {
    message: "OK",
    details: "Password changed successfully"
  }
}


export const updateRoleByUserId = async (
  authUserId: number,
  user_id: number,
  {
    role
  }: { role: string }
): Promise<SecureUser> => {

  await verifyValueIsPositiveInt(user_id)

  await searchForUserId(user_id)

  const userRole = await fetchUserRole(authUserId)

  await verifyPermission(userRole, UserRole.Admin)

  const result = await db.query(`
    UPDATE users
    SET role = $1
    WHERE user_id = $2
    RETURNING 
      user_id, 
      username, 
      email,
      first_name, 
      surname, 
      role,
      unit_system;
    `,
    [role, user_id])

  return result.rows[0]
}
