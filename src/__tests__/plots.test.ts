import data from "../db/data/test-data/index"
import { db } from "../db"
import { seed } from "../db/seeding/seed"
import request from "supertest"
import { app } from "../app"
import { Plot } from "../types/plot-types"


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


describe("GET /api/plots/:owner_id", () => {

  test("GET:200 Responds with an array of plot objects associated with the owner_id", async () => {

    const { body } = await request(app)
      .get("/api/plots/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.plots).toHaveLength(3)

    body.plots.forEach((plot: Plot) => {
      expect(plot).toMatchObject({
        plot_id: expect.any(Number),
        owner_id: 1,
        name: expect.any(String),
        type: expect.any(String),
        description: expect.any(String),
        location: expect.any(String),
        area: expect.any(Number)
      })
    })
  })

  test("GET:200 Responds with an empty array when no plots are associated with the owner_id", async () => {

    const auth = await request(app)
      .post("/api/login")
      .send({
        username: "quince_queen",
        password: "quince123",
      })

    token = auth.body.token

    const { body } = await request(app)
      .get("/api/plots/3")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(Array.isArray(body.plots)).toBe(true)
    expect(body.plots).toHaveLength(0)
  })

  test("GET:403 Responds with a warning when the authenticated user attempts to retrieve another user's plot data", async () => {

    const { body } = await request(app)
      .get("/api/plots/2")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject({
      message: "Forbidden",
      details: "Permission to view plot data denied"
    })
  })
})


describe("GET /api/plots/:owner_id?type=", () => {

  test("GET:200 Responds with an array of plot objects filtered by type", async () => {

    const { body } = await request(app)
      .get("/api/plots/1?type=garden")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.plots.every((plot: Plot) => {
      return plot.type === "garden"
    })).toBe(true)
  })

  test("GET:404 Responds with an error message when the query value is invalid", async () => {

    const { body } = await request(app)
      .get("/api/plots/1?type=castle")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "No results found for that query"
    })
  })
})


describe("GET /api/plots/:owner_id/:plot_id", () => {

  test("GET:200 Responds with a plot object matching the value of the plot_id parameter", async () => {

    const { body } = await request(app)
      .get("/api/plots/1/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.plot).toMatchObject({
      plot_id: 1,
      owner_id: 1,
      name: "John's Garden",
      type: "garden",
      description: "A vegetable garden",
      location: "Farmville",
      area: 100
    })
  })

  test("GET:403 Responds with a warning when the authenticated user's user_id does not match owner_id", async () => {

    const { body } = await request(app)
      .get("/api/plots/2/2")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject({
      message: "Forbidden",
      details: "Permission to view plot data denied"
    })
  })

  test("GET:403 Responds with a warning when the plot_id does not belong to the authenticated user", async () => {

    const { body } = await request(app)
      .get("/api/plots/1/99")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject({
      message: "Forbidden",
      details: "Permission to view plot data denied"
    })
  })
})
