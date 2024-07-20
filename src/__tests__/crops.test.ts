import data from "../db/data/test-data/test-index"
import { db } from "../db"
import { seed } from "../db/seeding/seed"
import request from "supertest"
import { app } from "../app"
import { Crop } from "../types/crop-types"
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

afterAll(() => {
  seed(data)
  db.end()
})


describe("GET /api/crops/:plot_id", () => {

  test("GET:200 Responds with an array of crop objects sorted by crop_id in ascending order", async () => {

    const { body } = await request(app)
      .get("/api/crops/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.crops.map((crop: Crop) => {
      return crop.crop_id
    })).toEqual([1, 2, 3, 4])

    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

    body.crops.forEach((crop: Crop) => {
      expect(crop).toMatchObject({
        crop_id: expect.any(Number),
        plot_id: 1,
        subdivision_id: expect.toBeOneOf([expect.any(Number), null]),
        name: expect.any(String),
        variety: expect.toBeOneOf([expect.any(String), null]),
        quantity: expect.toBeOneOf([expect.any(Number), null]),
        date_planted: expect.toBeOneOf([expect.stringMatching(regex), null]),
        harvest_date: expect.toBeOneOf([expect.stringMatching(regex), null]),
        subdivision_name: expect.toBeOneOf([expect.any(String), null]),
        note_count: expect.any(Number)
      })
    })
  })

  test("GET:200 Responds with an empty array when no crops are associated with the plot_id", async () => {

    const { body } = await request(app)
      .get("/api/crops/4")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(Array.isArray(body.crops)).toBe(true)
    expect(body.crops).toHaveLength(0)
  })

  test("GET:400 Responds with an error message when the plot_id is not a number", async () => {

    const { body } = await request(app)
      .get("/api/crops/example")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject({
      message: "Bad Request",
      details: "Invalid parameter"
    })
  })

  test("GET:403 Responds with a warning when the authenticated user attempts to retrieve another user's crop data", async () => {

    const { body } = await request(app)
      .get("/api/crops/2")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject({
      message: "Forbidden",
      details: "Permission to view crop data denied"
    })
  })

  test("GET:404 Responds with an error message when the plot_id does not exist", async () => {

    const { body } = await request(app)
      .get("/api/crops/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "Plot not found"
    })
  })

  test("GET:404 When the parent plot is deleted, all child crops are also deleted", async () => {

    await request(app)
      .delete("/api/plots/plot/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204)

    const { body } = await request(app)
      .get("/api/crops/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "Plot not found"
    })
  })

  test("GET:404 When the parent user is deleted, all child crops are also deleted", async () => {

    await request(app)
      .delete("/api/users/carrot_king")
      .set("Authorization", `Bearer ${token}`)
      .expect(204)

    const { body } = await request(app)
      .get("/api/crops/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "Plot not found"
    })
  })
})


describe("GET /api/crops/:plot_id?name=", () => {

  test("GET:200 Responds with an array of crop objects filtered by name", async () => {

    const { body } = await request(app)
      .get("/api/crops/1?name=ca")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.crops).toHaveLength(3)

    expect(body.crops.every((crop: Crop) => {
      return /ca/i.test(crop.name)
    })).toBe(true)
  })

  test("GET:200 Filtered results are case-insensitive", async () => {

    const { body } = await request(app)
      .get("/api/crops/1?name=CA")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.crops).toHaveLength(3)

    expect(body.crops.every((crop: Crop) => {
      return /ca/i.test(crop.name)
    })).toBe(true)
  })

  test("GET:200 Returns an empty array when the value of name matches no results", async () => {

    const { body } = await request(app)
      .get("/api/crops/1?name=example")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(Array.isArray(body.crops)).toBe(true)
    expect(body.crops).toHaveLength(0)
  })
})


describe("GET /api/crops/:plot_id?sort=", () => {

  test("GET:200 Responds with an array of crop objects sorted by name in ascending order", async () => {

    const { body } = await request(app)
      .get("/api/crops/1?sort=name")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.crops.map((crop: Crop) => {
      return crop.name
    })).toEqual([
      "apple",
      "cabbage",
      "carrot",
      "pecan"
    ])
  })

  test("GET:200 Responds with an array of crop objects sorted by date_planted in descending order while filtering out null values", async () => {

    const { body } = await request(app)
      .get("/api/crops/1?sort=date_planted")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.crops.map((crop: Crop) => {
      return crop.date_planted
    })).toEqual([
      "2024-07-18T23:00:00.000Z",
      "2024-06-19T23:00:00.000Z",
      "2023-09-20T23:00:00.000Z",
    ])
  })

  test("GET:200 Responds with an array of crop objects sorted by harvest_date in descending order while filtering out null values", async () => {

    const { body } = await request(app)
      .get("/api/crops/1?sort=harvest_date")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.crops.map((crop: Crop) => {
      return crop.harvest_date
    })).toEqual([
      "2026-07-18T23:00:00.000Z",
      "2024-09-20T23:00:00.000Z",
      "2024-09-14T23:00:00.000Z",
    ])
  })

  test("GET:404 Responds with an error when passed an invalid sort value", async () => {

    const { body } = await request(app)
      .get("/api/crops/1?sort=variety")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "No results found for that query"
    })
  })
})


describe("GET /api/crops/:plot_id?name=&sort=", () => {

  test("GET:200 Responds with an array of crop objects filtered by name and sorted by name in ascending order", async () => {

    const { body } = await request(app)
      .get("/api/crops/1?name=ca&sort=name")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.crops.map((crop: Crop) => {
      return crop.name
    })).toEqual([
      "cabbage",
      "carrot",
      "pecan"
    ])
  })

  test("GET:200 Responds with an array of crop objects filtered by name and sorted by harvest_date in descending order while filtering out null values", async () => {

    const { body } = await request(app)
      .get("/api/crops/1?name=ca&sort=harvest_date")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.crops.map((crop: Crop) => {
      return {
        name: crop.name,
        harvest_date: crop.harvest_date
      }
    })).toEqual([
      {
        name: "pecan",
        harvest_date: "2026-07-18T23:00:00.000Z"
      },
      {
        name: "carrot",
        harvest_date: "2024-09-14T23:00:00.000Z"
      }
    ])
  })
})


describe("GET /api/crops/:plot_id?order=", () => {

  test("GET:404 Responds with an error when passed an invalid order value", async () => {

    const { body } = await request(app)
      .get("/api/crops/1?order=example")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "No results found for that query"
    })
  })
})
