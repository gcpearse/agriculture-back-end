import data from "../db/data/test-data/test-index"
import { db } from "../db"
import { seed } from "../db/seeding/seed"
import request from "supertest"
import { app } from "../app"
import { SecureUser, UnitSystem, UserRole } from "../types/user-types"
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

  test("GET:200 Responds with an array of user objects", async () => {

    const { body } = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const user of body.users) {
      expect(user).toMatchObject<SecureUser>({
        user_id: expect.any(Number),
        username: expect.any(String),
        email: expect.any(String),
        first_name: expect.any(String),
        surname: expect.any(String),
        role: expect.any(String),
        unit_preference: expect.any(String)
      })
    }
  })

  test("GET:403 Responds with a warning when the authenticated user is not an admin", async () => {

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
      details: "Permission to view user data denied"
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
  })

  test("GET:404 Responds with an error message when the query value is invalid", async () => {

    const { body } = await request(app)
      .get("/api/users?unit_preference=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid unit system"
    })
  })
})


describe("GET /api/users?unit_preference=", () => {

  test("GET:200 Responds with an array of user objects filtered by unit preference", async () => {

    const { body } = await request(app)
      .get("/api/users?unit_preference=metric")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const user of body.users) {
      expect(user.unit_preference).toBe(UnitSystem.Metric)
    }
  })

  test("GET:404 Responds with an error message when the query value is invalid", async () => {

    const { body } = await request(app)
      .get("/api/users?role=uuserr")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid user role"
    })
  })
})


describe("GET /api/users/:username", () => {

  test("GET:200 Responds with a user object matching the value of the username parameter", async () => {

    const { body } = await request(app)
      .get("/api/users/carrot_king")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.user).toMatchObject<SecureUser>({
      user_id: 1,
      username: "carrot_king",
      email: "john.smith@example.com",
      first_name: "John",
      surname: "Smith",
      role: UserRole.Admin,
      unit_preference: UnitSystem.Imperial
    })
  })

  test("GET:403 Responds with a warning when the authenticated user attempts to retrieve another user's data", async () => {

    const { body } = await request(app)
      .get("/api/users/peach_princess")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission to view user data denied"
    })
  })

  test("GET:404 Responds with an error message when the username does not exist", async () => {

    const { body } = await request(app)
      .get("/api/users/non_existent_user")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "User not found"
    })
  })
})


describe("PATCH /api/users/:username", () => {

  test("PATCH:200 Responds with an updated user object", async () => {

    const newDetails = {
      email: "jsj@example.com",
      first_name: "Johnny",
      surname: "Smith-Jones",
      unit_preference: "metric"
    }

    const { body } = await request(app)
      .patch("/api/users/carrot_king")
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
      unit_preference: UnitSystem.Metric
    })
  })

  test("PATCH:400 Responds with an error when a property is missing from the request body", async () => {

    const newDetails = {
      email: "jsj@example.com",
      surname: "Smith-Jones",
      unit_preference: "metric"
    }

    const { body } = await request(app)
      .patch("/api/users/carrot_king")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Not null violation"
    })
  })

  test("PATCH:400 Responds with an error when an invalid value is passed for unit_preference", async () => {

    const newDetails = {
      email: "jsj@example.com",
      first_name: "Johnny",
      surname: "Smith-Jones",
      unit_preference: "international"
    }

    const { body } = await request(app)
      .patch("/api/users/carrot_king")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid text representation"
    })
  })

  test("PATCH:403 Responds with a warning when the authenticated user attempts to edit another user's data", async () => {

    const newDetails = {
      email: "john.smith@example.com",
      first_name: "John",
      surname: "Smith",
      unit_preference: "imperial"
    }

    const { body } = await request(app)
      .patch("/api/users/peach_princess")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission to edit user data denied"
    })
  })

  test("PATCH:404 Responds with an error message when the username does not exist", async () => {

    const newDetails = {
      email: "john.smith@example.com",
      first_name: "John",
      surname: "Smith",
      unit_preference: "imperial"
    }

    const { body } = await request(app)
      .patch("/api/users/non_existent_user")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "User not found"
    })
  })

  test("PATCH:409 Responds with an error message when the email already exists", async () => {

    const newDetails = {
      email: "olivia.jones@example.com",
      first_name: "John",
      surname: "Smith",
      unit_preference: "imperial"
    }

    const { body } = await request(app)
      .patch("/api/users/carrot_king")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(409)

    expect(body).toMatchObject<StatusResponse>({
      message: "Conflict",
      details: "Email already exists"
    })
  })
})


describe("DELETE /api/users/:username", () => {

  test("DELETE:204 Deletes the user with the given username", async () => {

    await request(app)
      .delete("/api/users/carrot_king")
      .set("Authorization", `Bearer ${token}`)
      .expect(204)

    const { body } = await request(app)
      .get("/api/users/carrot_king")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "User not found"
    })
  })

  test("DELETE:403 Responds with a warning when the authenticated user attempts to delete another user's data", async () => {

    const { body } = await request(app)
      .delete("/api/users/peach_princess")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission to delete user data denied"
    })
  })

  test("DELETE:404 Responds with an error message when the username does not exist", async () => {

    const { body } = await request(app)
      .delete("/api/users/non_existent_user")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "User not found"
    })
  })
})


describe("PATCH /api/users/:username/password", () => {

  test("PATCH:200 Responds with a status object confirming success", async () => {

    const passwordUpdate = {
      oldPassword: "carrots123",
      newPassword: "onions789"
    }

    const { body } = await request(app)
      .patch("/api/users/carrot_king/password")
      .send(passwordUpdate)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body).toMatchObject<StatusResponse>({
      message: "OK",
      details: "Password changed successfully"
    })
  })

  test("PATCH:401 Responds with an error when the old password does not match the current password", async () => {

    const passwordUpdate = {
      oldPassword: "apples567",
      newPassword: "onions789"
    }

    const { body } = await request(app)
      .patch("/api/users/carrot_king/password")
      .send(passwordUpdate)
      .set("Authorization", `Bearer ${token}`)
      .expect(401)

    expect(body).toMatchObject<StatusResponse>({
      message: "Unauthorized",
      details: "Incorrect password"
    })
  })

  test("PATCH:403 Responds with a warning when the authenticated user attempts to change another user's password", async () => {

    const passwordUpdate = {
      oldPassword: "peaches123",
      newPassword: "onions789"
    }

    const { body } = await request(app)
      .patch("/api/users/peach_princess/password")
      .send(passwordUpdate)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission to edit password denied"
    })
  })

  test("PATCH:404 Responds with an error message when the username does not exist", async () => {

    const passwordUpdate = {
      oldPassword: "carrots123",
      newPassword: "onions789"
    }

    const { body } = await request(app)
      .patch("/api/users/non_existent_user/password")
      .send(passwordUpdate)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "User not found"
    })
  })

  // 500 status code here as the error is thrown by passing undefined as an argument to generateHash
  test("PATCH:500 Responds with an error when newPassword is missing from the request body", async () => {

    const passwordUpdate = {
      oldPassword: "carrots123"
    }

    await request(app)
      .patch("/api/users/carrot_king/password")
      .send(passwordUpdate)
      .set("Authorization", `Bearer ${token}`)
      .expect(500)
  })
})
