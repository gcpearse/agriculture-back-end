import data from "../db/data/test-data/data-index"
import { db } from "../db"
import { seed } from "../db/seeding/seed"
import request from "supertest"
import { app } from "../app"


let token: string


beforeEach(async () => {

  await seed(data)

  const auth = await request(app)
    .post("/api/login")
    .send({
      username: "carrot_king",
      password: "carrots123",
    })

  token = auth.body.token
})

afterAll(() => db.end())


describe("GET /api/users/:username", () => {

  test("GET:200 Responds with a user object matching the value of the username parameter", async () => {

    const { body } = await request(app)
      .get("/api/users/carrot_king")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.user).toMatchObject({
      user_id: 1,
      username: "carrot_king",
      first_name: "John",
      surname: "Smith",
      unit_preference: "imperial"
    })
  })

  test("GET:403 Responds with a warning when the authenticated user attempts to retrieve another user's data", async () => {

    const { body } = await request(app)
      .get("/api/users/peach_princess")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject({
      message: "Forbidden",
      details: "Permission to view user data denied"
    })
  })
})


describe("PATCH /api/users/:username", () => {

  test("PATCH:200 Responds with an updated user object", async () => {

    const newDetails = {
      first_name: "Johnny",
      surname: "Smith-Jones",
      unit_preference: "metric"
    }

    const { body } = await request(app)
      .patch("/api/users/carrot_king")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.user).toMatchObject({
      user_id: 1,
      username: "carrot_king",
      first_name: "Johnny",
      surname: "Smith-Jones",
      unit_preference: "metric"
    })
  })

  test("PATCH:400 Responds with an error when an invalid value is passed for unit_preference", async () => {

    const newDetails = {
      first_name: "Johnny",
      surname: "Smith-Jones",
      unit_preference: "international"
    }

    const { body } = await request(app)
      .patch("/api/users/carrot_king")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject({
      message: "Bad Request",
      details: "Invalid text representation"
    })
  })

  test("PATCH:403 Responds with a warning when the authenticated user attempts to edit another user's data", async () => {

    const newDetails = {
      first_name: "John",
      surname: "Smith",
      unit_preference: "imperial"
    }

    const { body } = await request(app)
      .patch("/api/users/peach_princess")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject({
      message: "Forbidden",
      details: "Permission to edit user data denied"
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

    expect(body).toMatchObject({
      message: "Not Found",
      details: "User not found"
    })
  })

  test("DELETE:403 Responds with a warning when the authenticated user attempts to delete another user's data", async () => {

    const { body } = await request(app)
      .delete("/api/users/peach_princess")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject({
      message: "Forbidden",
      details: "Permission to delete user data denied"
    })
  })
})


describe("PATCH /api/users/:username/password", () => {

  test("PATCH:200 Responds with an updated user object", async () => {

    const { body } = await request(app)
      .patch("/api/users/carrot_king/password")
      .send({ password: "onions789" })
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.user).toMatchObject({
      user_id: 1,
      username: "carrot_king",
      first_name: "John",
      surname: "Smith",
      unit_preference: "imperial"
    })
  })

  test("PATCH:403 Responds with a warning when the authenticated user attempts to chanhge another user's password", async () => {

    const { body } = await request(app)
      .patch("/api/users/peach_princess/password")
      .send({ password: "onions789" })
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject({
      message: "Forbidden",
      details: "Permission to edit password denied"
    })
  })
})
