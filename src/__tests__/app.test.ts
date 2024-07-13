import data from "../db/data/test-data/index"
import { db } from "../db"
import { seed } from "../db/seeding/seed"
import request from "supertest"
import { app } from "../app"
import { Credentials, User } from "../types"


beforeEach(() => seed(data))
afterAll(() => db.end())


describe("POST /api/register", () => {

  test("POST:201 Responds with the newly created user", async () => {

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

    expect(body).toMatchObject({
      username: "farmer123",
      password: "password123",
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

  test("POST:200 Responds with the username of the logged in user when the credentials are valid", async () => {

    const user: Credentials = {
      username: "carrot_king",
      password: "carrots123"
    }

    const { body } = await request(app)
      .post("/api/login")
      .send(user)
      .expect(200)

    expect(body).toMatchObject({
      username: "carrot_king"
    })
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
