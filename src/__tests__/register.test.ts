import data from "../db/data/test-data/data-index"
import { db } from "../db"
import { seed } from "../db/seeding/seed"
import request from "supertest"
import { app } from "../app"


beforeEach(() => seed(data))

afterAll(() => db.end())


describe("POST /api/register", () => {

  test("POST:201 Responds with a new user object without a password property", async () => {

    const newUser = {
      username: "farmer123",
      password: "password123",
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
      first_name: "Fred",
      surname: "Flint",
      unit_preference: "metric"
    })
  })

  test("POST:409 Responds with an error message when the username already exists", async () => {

    const newUser = {
      username: "carrot_king",
      password: "password234",
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
})
