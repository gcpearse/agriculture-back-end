import data from "../db/data/test-data/index"
import { db } from "../db"
import { seed } from "../db/seeding/seed"
import request from "supertest"
import { app } from "../app"
import { Credentials, User } from "../types"


beforeEach(() => seed(data))
afterAll(() => db.end())


describe("POST /api/register", () => {

  test("POST:201 Responds with a new user object without a password property", async () => {

    const newUser: User = {
      username: "farmer123",
      password: "password123",
      first_name: "Fred",
      surname: "Flint",
      uses_metric: true
    }

    const { body } = await request(app)
      .post("/api/register")
      .send(newUser)
      .expect(201)

    expect(body.user).toMatchObject({
      user_id: 3,
      username: "farmer123",
      first_name: "Fred",
      surname: "Flint",
      uses_metric: true
    })
  })

  test("POST:409 Responds with an error message when the username already exists", async () => {

    const newUser: User = {
      username: "carrot_king",
      password: "password234",
      first_name: "Bob",
      surname: "Booth",
      uses_metric: false
    }

    const { body } = await request(app)
      .post("/api/register")
      .send(newUser)
      .expect(409)

    expect(body.message).toBe("Username already exists")
  })
})


describe("POST /api/login", () => {

  test("POST:200 Responds with a JWT token when the credentials are valid", async () => {

    const user: Credentials = {
      username: "carrot_king",
      password: "carrots123"
    }

    const { body } = await request(app)
      .post("/api/login")
      .send(user)
      .expect(200)

    expect(body.token).toMatch(/\w+\.\w+\.\w+/)
  })

  test("POST:404 Responds with an error message when the username is not found", async () => {

    const user: Credentials = {
      username: "mango_man",
      password: "carrots123"
    }

    const { body } = await request(app)
      .post("/api/login")
      .send(user)
      .expect(404)

    expect(body.message).toBe("Username not found")
  })

  test("POST:401 Responds with an error message when the password is incorrect", async () => {

    const user: Credentials = {
      username: "carrot_king",
      password: "apples123"
    }

    const { body } = await request(app)
      .post("/api/login")
      .send(user)
      .expect(401)

    expect(body.message).toBe("Incorrect password")
  })
})


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

    expect(body.message).toBe("Success")
  })

  test("GET:403 Responds with a warning when the token cannot be verified", async () => {

    const { body } = await request(app)
      .get("/api/auth")
      .set("Authorization", `Bearer invalidToken`)
      .expect(403)

    expect(body.message).toBe("Forbidden")
  })

  test("GET:401 Responds with an authorisation warning when valid credentials have not been provided", async () => {

    const { body } = await request(app)
      .get("/api/auth")
      .expect(401)

    expect(body.message).toBe("Unauthorised")
  })
})
