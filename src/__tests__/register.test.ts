import data from "../db/data/test-data/test-index"
import { db } from "../db"
import { seed } from "../db/seeding/seed"
import { app } from "../app"

import request from "supertest"

import { SecureUser, UnitSystem, UnregisteredUser, UserRole } from "../types/user-types"
import { StatusResponse } from "../types/response-types"


beforeEach(() => seed(data))

afterAll(async () => {
  await seed(data)
  db.end()
})


describe("POST /api/register", () => {

  test("POST:201 Responds with a new user object with an automatically assigned default user role", async () => {

    const newUser: UnregisteredUser = {
      username: "farmer123",
      password: "Password123",
      email: "fred.flint@example.com",
      first_name: "Fred",
      surname: "Flint",
      unit_system: UnitSystem.Metric
    }

    const { body } = await request(app)
      .post("/api/register")
      .send(newUser)
      .expect(201)

    expect(body.user).toMatchObject<SecureUser>({
      user_id: 4,
      username: "farmer123",
      email: "fred.flint@example.com",
      first_name: "Fred",
      surname: "Flint",
      role: UserRole.User,
      unit_system: UnitSystem.Metric
    })
  })

  test("POST:400 Responds with an error when the password format is invalid", async () => {

    const newUser: UnregisteredUser = {
      username: "farmer123",
      password: "password123",
      email: "fred.flint@example.com",
      first_name: "Fred",
      surname: "Flint",
      unit_system: UnitSystem.Metric
    }

    const { body } = await request(app)
      .post("/api/register")
      .send(newUser)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid password format"
    })
  })

  test("POST:409 Responds with an error when the username already exists", async () => {

    const newUser: UnregisteredUser = {
      username: "carrot_king",
      password: "password234",
      email: "bob.booth@example.com",
      first_name: "Bob",
      surname: "Booth",
      unit_system: UnitSystem.Imperial
    }

    const { body } = await request(app)
      .post("/api/register")
      .send(newUser)
      .expect(409)

    expect(body).toMatchObject<StatusResponse>({
      message: "Conflict",
      details: "Username already exists"
    })
  })

  test("POST:409 Responds with an error when the email already exists", async () => {

    const newUser: UnregisteredUser = {
      username: "farmer123",
      password: "password123",
      email: "john.smith@example.com",
      first_name: "Fred",
      surname: "Flint",
      unit_system: UnitSystem.Metric
    }

    const { body } = await request(app)
      .post("/api/register")
      .send(newUser)
      .expect(409)

    expect(body).toMatchObject<StatusResponse>({
      message: "Conflict",
      details: "Email already exists"
    })
  })
})
