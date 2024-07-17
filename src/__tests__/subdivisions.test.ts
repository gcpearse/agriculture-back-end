import data from "../db/data/test-data/data-index"
import { db } from "../db"
import { seed } from "../db/seeding/seed"
import request from "supertest"
import { app } from "../app"
import { Subdivision } from "../types/subdivision-types"
import { toBeOneOf } from 'jest-extended'
expect.extend({ toBeOneOf })


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


describe("GET /api/subdivisions/:plot_id", () => {

  test("GET:200 Responds with an array of subdivision objects", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.subdivisions).toHaveLength(3)

    body.subdivisions.forEach((subdivision: Subdivision) => {
      expect(subdivision).toMatchObject({
        subdivision_id: expect.any(Number),
        plot_id: 1,
        name: expect.any(String),
        type: expect.any(String),
        description: expect.any(String),
        area: expect.toBeOneOf([expect.any(Number), null])
      })
    })
  })

  test("GET:200 Responds with an empty array when no subdivisions are associated with the plot_id", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/3")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(Array.isArray(body.subdivisions)).toBe(true)
    expect(body.subdivisions).toHaveLength(0)
  })

  test("GET:403 Responds with a warning when the authenticated user attempts to retrieve another user's subdivision data", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/2")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject({
      message: "Forbidden",
      details: "Permission to view plot subdivision data denied"
    })
  })

  test("GET:Responds with an error message when the plot_id does not exist", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "Plot not found"
    })
  })

  test("GET:Responds with an error message when the plot_id is not a number", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/example")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "Plot not found"
    })
  })
})
