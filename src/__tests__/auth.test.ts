import data from "../db/data/test-data/index"
import { db } from "../db"
import { seed } from "../db/seeding/seed"
import request from "supertest"
import { app } from "../app"


beforeEach(() => seed(data))
afterAll(() => db.end())


describe("GET /api/auth", () => {

  test("GET:200 Responds with a success message when the credentials are valid", async () => {

    const auth = await request(app)
      .post("/api/login")
      .send({
        username: "carrot_king",
        password: "carrots123",
      })

    const { body } = await request(app)
      .get("/api/auth")
      .set("Authorization", `Bearer ${auth.body.token}`)
      .expect(200)

    expect(body).toMatchObject({
      message: "OK",
      details: "Authentication successful"
    })
  })

  test("GET:401 Responds with an authorisation warning when valid credentials have not been provided", async () => {

    const { body } = await request(app)
      .get("/api/auth")
      .expect(401)

    expect(body).toMatchObject({
      message: "Unauthorized",
      details: "Invalid credentials provided"
    })
  })

  test("GET:403 Responds with a warning when the token cannot be verified", async () => {

    const { body } = await request(app)
      .get("/api/auth")
      .set("Authorization", `Bearer invalidToken`)
      .expect(403)

    expect(body).toMatchObject({
      message: "Forbidden",
      details: "Token could not be verified"
    })
  })
})
