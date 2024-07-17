import data from "../db/data/test-data/test-index"
import { db } from "../db"
import { seed } from "../db/seeding/seed"
import request from "supertest"
import { app } from "../app"


beforeEach(() => seed(data))

afterAll(() => db.end())


describe("POST /api/login", () => {

  test("POST:200 Responds with a JWT token when the credentials are valid", async () => {

    const user = {
      username: "carrot_king",
      password: "carrots123"
    }

    const { body } = await request(app)
      .post("/api/login")
      .send(user)
      .expect(200)

    expect(body.token).toMatch(/[\w-]{2,}\.[\w-]{2,}\.[\w-]{2,}/)
  })

  test("POST:401 Responds with an error message when the password is incorrect", async () => {

    const user = {
      username: "carrot_king",
      password: "apples123"
    }

    const { body } = await request(app)
      .post("/api/login")
      .send(user)
      .expect(401)

    expect(body).toMatchObject({
      message: "Unauthorized",
      details: "Incorrect password"
    })
  })

  test("POST:404 Responds with an error message when the username is not found", async () => {

    const user = {
      username: "mango_man",
      password: "carrots123"
    }

    const { body } = await request(app)
      .post("/api/login")
      .send(user)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "Username could not be found"
    })
  })
})
