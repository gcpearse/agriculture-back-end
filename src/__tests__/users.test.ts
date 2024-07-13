import data from "../db/data/test-data/index"
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


describe("GET /api/users/username", () => {

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
      uses_metric: false
    })
  })

  test("GET:403 Responds with a warning when the authenticated user's username does not match the value of the username parameter", async () => {

    const { body } = await request(app)
      .get("/api/users/peach_princess")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body.message).toBe("Access to user data denied")
  })
})
