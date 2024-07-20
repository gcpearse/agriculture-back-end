import data from "../db/data/test-data/test-index"
import { db } from "../db"
import { seed } from "../db/seeding/seed"
import request from "supertest"
import { app } from "../app"


beforeEach(() => seed(data))

afterAll(() => {
  seed(data)
  db.end()
})


describe("POST /api/register", () => {

  test("POST:201 Responds with a new user object without a password property", async () => {

    const newUser = {
      username: "farmer123",
      password: "password123",
      email: "fred.flint@example.com",
      first_name: "Fred",
      surname: "Flint",
      unit_preference: "metric"
    }

    const { body } = await request(app)
      .post("/api/register")
      .send(newUser)
      .expect(201)

    expect(body.user).toMatchObject({
      user_id: 4,
      username: "farmer123",
      email: "fred.flint@example.com",
      first_name: "Fred",
      surname: "Flint",
      unit_preference: "metric"
    })
  })

  test("POST:400 Responds with an error when a required property is missing from the request body", async () => {

    const newUser = {
      password: "password123",
      email: "fred.flint@example.com",
      first_name: "Fred",
      surname: "Flint",
      unit_preference: "metric"
    }

    const { body } = await request(app)
      .post("/api/register")
      .send(newUser)
      .expect(400)

    expect(body).toMatchObject({
      message: "Bad Request",
      details: "Not null violation"
    })
  })

  test("POST:409 Responds with an error message when the username already exists", async () => {

    const newUser = {
      username: "carrot_king",
      password: "password234",
      email: "bob.booth@example.com",
      first_name: "Bob",
      surname: "Booth",
      unit_preference: "imperial"
    }

    const { body } = await request(app)
      .post("/api/register")
      .send(newUser)
      .expect(409)

    expect(body).toMatchObject({
      message: "Conflict",
      details: "Username already exists"
    })
  })

  test("POST:409 Responds with an error message when the email already exists", async () => {

    const newUser = {
      username: "farmer123",
      password: "password123",
      email: "john.smith@example.com",
      first_name: "Fred",
      surname: "Flint",
      unit_preference: "metric"
    }

    const { body } = await request(app)
      .post("/api/register")
      .send(newUser)
      .expect(409)

    expect(body).toMatchObject({
      message: "Conflict",
      details: "Email already exists"
    })
  })
})
