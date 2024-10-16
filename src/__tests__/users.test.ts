import data from "../db/data/test-data/test-index"
import { db } from "../db"
import { seed } from "../db/seeding/seed"
import request from "supertest"
import { app } from "../app"
import { PasswordUpdate, SecureUser, UnitSystem, UserRequest, UserRole } from "../types/user-types"
import { StatusResponse } from "../types/response-types"


let token: string


beforeEach(async () => {

  await seed(data)

  const auth = await request(app)
    .post("/api/login")
    .send({
      login: "carrot_king",
      password: "carrots123",
    })

  token = auth.body.token
})

afterAll(async () => {
  await seed(data)
  db.end()
})


describe("GET /api/users", () => {

  test("GET:200 Responds with an array of user objects sorted by user_id in ascending order", async () => {

    const { body } = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const sortedUsers: SecureUser[] = [...body.users].sort((a: SecureUser, b: SecureUser) => {
      if (a.user_id! > b.user_id!) return 1
      if (a.user_id! < b.user_id!) return -1
      return 0
    })

    expect(body.users).toEqual(sortedUsers)

    for (const user of body.users) {
      expect(user).toMatchObject<SecureUser>({
        user_id: expect.any(Number),
        username: expect.any(String),
        email: expect.any(String),
        first_name: expect.any(String),
        surname: expect.any(String),
        role: expect.any(String),
        unit_system: expect.any(String)
      })
    }

    expect(body.count).toBe(3)
  })

  test("GET:403 Responds with an error when the authenticated user is not an admin", async () => {

    const auth = await request(app)
      .post("/api/login")
      .send({
        login: "quince_queen",
        password: "quince123",
      })

    token = auth.body.token

    const { body } = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })
})


describe("GET /api/users?role=", () => {

  test("GET:200 Responds with an array of user objects filtered by role", async () => {

    const { body } = await request(app)
      .get("/api/users?role=user")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const user of body.users) {
      expect(user.role).toBe(UserRole.User)
    }

    expect(body.count).toBe(2)
  })

  test("GET:400 Responds with an error when the query value is invalid", async () => {

    const { body } = await request(app)
      .get("/api/users?unit_system=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid unit system"
    })
  })
})


describe("GET /api/users?unit_system=", () => {

  test("GET:200 Responds with an array of user objects filtered by unit system", async () => {

    const { body } = await request(app)
      .get("/api/users?unit_system=metric")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const user of body.users) {
      expect(user.unit_system).toBe(UnitSystem.Metric)
    }

    expect(body.count).toBe(2)
  })

  test("GET:400 Responds with an error when the query value is invalid", async () => {

    const { body } = await request(app)
      .get("/api/users?unit_system=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid unit system"
    })
  })
})


describe("GET /api/users?sort=", () => {

  test("GET:200 Responds with an array of user objects sorted by email in ascending order", async () => {

    const { body } = await request(app)
      .get("/api/users?sort=email")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const sortedUsers: SecureUser[] = [...body.users].sort((a: SecureUser, b: SecureUser) => {
      if (a.email > b.email) return 1
      if (a.email < b.email) return -1
      return 0
    })

    expect(body.users).toEqual(sortedUsers)

    expect(body.count).toBe(3)
  })

  test("GET:200 Responds with an array of user objects sorted by surname in ascending order", async () => {

    const { body } = await request(app)
      .get("/api/users?sort=surname")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const sortedUsers: SecureUser[] = [...body.users].sort((a: SecureUser, b: SecureUser) => {
      if (a.surname > b.surname) return 1
      if (a.surname < b.surname) return -1
      return 0
    })

    expect(body.users).toEqual(sortedUsers)

    expect(body.count).toBe(3)
  })

  test("GET:400 Responds with an error when passed an invalid sort value", async () => {

    const { body } = await request(app)
      .get("/api/users?sort=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid query value"
    })
  })
})


describe("GET /api/users?role=&sort=", () => {

  test("GET:200 Responds with an array of user objects filtered by role and sorted by first name in ascending order", async () => {

    const { body } = await request(app)
      .get("/api/users?role=user&sort=first_name")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const sortedUsers: SecureUser[] = [...body.users].sort((a: SecureUser, b: SecureUser) => {
      if (a.first_name > b.first_name) return 1
      if (a.first_name < b.first_name) return -1
      return 0
    })

    for (const user of body.users) {
      expect(user.role).toBe(UserRole.User)
    }

    expect(body.users).toEqual(sortedUsers)

    expect(body.count).toBe(2)
  })
})


describe("GET /api/users?order=", () => {

  test("GET:200 Responds with an array of user objects ordered by user_id in descending order", async () => {

    const { body } = await request(app)
      .get("/api/users?order=desc")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const sortedUsers: SecureUser[] = [...body.users].sort((a: SecureUser, b: SecureUser) => {
      if (a.user_id! < b.user_id!) return 1
      if (a.user_id! > b.user_id!) return -1
      return 0
    })

    expect(body.users).toEqual(sortedUsers)

    expect(body.count).toBe(3)
  })

  test("GET:400 Responds with an error when passed an invalid order value", async () => {

    const { body } = await request(app)
      .get("/api/users?order=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid query value"
    })
  })
})


describe("GET /api/users?limit=", () => {

  test("GET:200 Responds with a limited array of user objects", async () => {

    const { body } = await request(app)
      .get("/api/users?limit=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.users).toHaveLength(2)

    expect(body.count).toBe(3)
  })

  test("GET:200 Responds with an array of all crops associated with the plot when the limit exceeds the total number of results", async () => {

    const { body } = await request(app)
      .get("/api/users?limit=100")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.users).toHaveLength(3)

    expect(body.count).toBe(3)
  })

  test("GET:400 Responds with an error when the value of limit is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/users?limit=two")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })
})


describe("GET /api/users?page=", () => {

  test("GET:200 Responds with an array of user objects beginning from the page set in the query parameter", async () => {

    const { body } = await request(app)
      .get("/api/users?limit=2&page=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.users.map((user: SecureUser) => {
      return user.user_id
    })).toEqual([3])

    expect(body.count).toBe(3)
  })

  test("GET:200 The page defaults to page one", async () => {

    const { body } = await request(app)
      .get("/api/users?limit=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.users.map((user: SecureUser) => {
      return user.user_id
    })).toEqual([1, 2])

    expect(body.count).toBe(3)
  })

  test("GET:400 Responds with an error when the value of page is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/users?page=two")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("GET:404 Responds with an error when the page cannot be found", async () => {

    const { body } = await request(app)
      .get("/api/users?limit=2&page=3")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Page not found"
    })
  })
})


describe("GET /api/users/:user_id", () => {

  test("GET:200 Responds with a user object matching the value of the user_id parameter", async () => {

    const { body } = await request(app)
      .get("/api/users/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.user).toMatchObject<SecureUser>({
      user_id: 1,
      username: "carrot_king",
      email: "john.smith@example.com",
      first_name: "John",
      surname: "Smith",
      role: UserRole.Admin,
      unit_system: UnitSystem.Imperial
    })
  })

  test("GET:400 Responds with an error when the user_id parameter is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/users/one")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("GET:403 Responds with an error when the authenticated user attempts to retrieve another user's data", async () => {

    const { body } = await request(app)
      .get("/api/users/2")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("GET:404 Responds with an error when the user does not exist", async () => {

    const { body } = await request(app)
      .get("/api/users/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "User not found"
    })
  })
})


describe("PATCH /api/users/:user_id", () => {

  test("PATCH:200 Responds with an updated user object", async () => {

    const newDetails: UserRequest = {
      email: "jsj@example.com",
      first_name: "Johnny",
      surname: "Smith-Jones",
      unit_system: UnitSystem.Metric
    }

    const { body } = await request(app)
      .patch("/api/users/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.user).toMatchObject<SecureUser>({
      user_id: 1,
      username: "carrot_king",
      email: "jsj@example.com",
      first_name: "Johnny",
      surname: "Smith-Jones",
      role: UserRole.Admin,
      unit_system: UnitSystem.Metric
    })
  })

  test("PATCH:400 Responds with an error when the user_id parameter is not a positive integer", async () => {

    const newDetails: UserRequest = {
      email: "jsj@example.com",
      first_name: "Johnny",
      surname: "Smith-Jones",
      unit_system: UnitSystem.Metric
    }

    const { body } = await request(app)
      .patch("/api/users/one")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("PATCH:403 Responds with an error when the authenticated user attempts to edit another user's data", async () => {

    const newDetails: UserRequest = {
      email: "john.smith@example.com",
      first_name: "John",
      surname: "Smith",
      unit_system: UnitSystem.Imperial
    }

    const { body } = await request(app)
      .patch("/api/users/2")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("PATCH:404 Responds with an error when the user does not exist", async () => {

    const newDetails: UserRequest = {
      email: "john.smith@example.com",
      first_name: "John",
      surname: "Smith",
      unit_system: UnitSystem.Imperial
    }

    const { body } = await request(app)
      .patch("/api/users/999")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "User not found"
    })
  })

  test("PATCH:409 Responds with an error when the email already exists", async () => {

    const newDetails: UserRequest = {
      email: "olivia.jones@example.com",
      first_name: "John",
      surname: "Smith",
      unit_system: UnitSystem.Imperial
    }

    const { body } = await request(app)
      .patch("/api/users/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(409)

    expect(body).toMatchObject<StatusResponse>({
      message: "Conflict",
      details: "Email already exists"
    })
  })
})


describe("DELETE /api/users/:user_id", () => {

  test("DELETE:204 Deletes the user with the given user ID", async () => {

    await request(app)
      .delete("/api/users/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204)

    const { body } = await request(app)
      .get("/api/users/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "User not found"
    })
  })

  test("DELETE:400 Responds with an error when the user_id parameter is not a positive integer", async () => {

    const { body } = await request(app)
      .delete("/api/users/one")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("DELETE:403 Responds with an error when the authenticated user attempts to delete another user's data", async () => {

    const { body } = await request(app)
      .delete("/api/users/2")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("DELETE:404 Responds with an error when the user does not exist", async () => {

    const { body } = await request(app)
      .delete("/api/users/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "User not found"
    })
  })
})


describe("PATCH /api/users/:user_id/password", () => {

  test("PATCH:200 Responds with a success message when the password is changed successfully", async () => {

    const passwordUpdate: PasswordUpdate = {
      oldPassword: "carrots123",
      newPassword: "onions789"
    }

    const { body } = await request(app)
      .patch("/api/users/1/password")
      .send(passwordUpdate)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body).toMatchObject<StatusResponse>({
      message: "OK",
      details: "Password changed successfully"
    })
  })

  test("PATCH:400 Responds with an error when the user_id is not a positive integer", async () => {

    const passwordUpdate: PasswordUpdate = {
      oldPassword: "carrots123",
      newPassword: "onions789"
    }

    const { body } = await request(app)
      .patch("/api/users/one/password")
      .send(passwordUpdate)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("PATCH:401 Responds with an error when the value of oldPassword does not match the current password", async () => {

    const passwordUpdate: PasswordUpdate = {
      oldPassword: "apples567",
      newPassword: "onions789"
    }

    const { body } = await request(app)
      .patch("/api/users/1/password")
      .send(passwordUpdate)
      .set("Authorization", `Bearer ${token}`)
      .expect(401)

    expect(body).toMatchObject<StatusResponse>({
      message: "Unauthorized",
      details: "Incorrect password"
    })
  })

  test("PATCH:403 Responds with an error when the authenticated user attempts to change another user's password", async () => {

    const passwordUpdate: PasswordUpdate = {
      oldPassword: "peaches123",
      newPassword: "onions789"
    }

    const { body } = await request(app)
      .patch("/api/users/2/password")
      .send(passwordUpdate)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("PATCH:404 Responds with an error when the user does not exist", async () => {

    const passwordUpdate: PasswordUpdate = {
      oldPassword: "carrots123",
      newPassword: "onions789"
    }

    const { body } = await request(app)
      .patch("/api/users/999/password")
      .send(passwordUpdate)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "User not found"
    })
  })
})


describe("PATCH /api/users/:user_id/role", () => {

  test("PATCH:200 Responds with an updated user object", async () => {

    const newRole: { role: UserRole } = {
      role: UserRole.Supervisor
    }

    const { body } = await request(app)
      .patch("/api/users/2/role")
      .send(newRole)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.user).toMatchObject<SecureUser>({
      user_id: 2,
      username: "peach_princess",
      email: "olivia.jones@example.com",
      first_name: "Olivia",
      surname: "Jones",
      role: UserRole.Supervisor,
      unit_system: UnitSystem.Metric
    })
  })

  test("PATCH:400 Responds with an error when the user_id parameter is not a positive integer", async () => {

    const newRole: { role: UserRole } = {
      role: UserRole.Supervisor
    }

    const { body } = await request(app)
      .patch("/api/users/two/role")
      .send(newRole)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("PATCH:403 Responds with an error when the authenticated user is not an admin", async () => {

    const newRole: { role: UserRole } = {
      role: UserRole.Supervisor
    }

    const auth = await request(app)
      .post("/api/login")
      .send({
        login: "quince_queen",
        password: "quince123",
      })

    token = auth.body.token

    const { body } = await request(app)
      .patch("/api/users/2/role")
      .send(newRole)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("PATCH:404 Responds with an error when the user does not exist", async () => {

    const newRole: { role: UserRole } = {
      role: UserRole.Supervisor
    }

    const { body } = await request(app)
      .patch("/api/users/999/role")
      .send(newRole)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "User not found"
    })
  })
})
