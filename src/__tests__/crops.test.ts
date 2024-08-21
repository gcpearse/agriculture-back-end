import data from "../db/data/test-data/test-index"
import { db } from "../db"
import { seed } from "../db/seeding/seed"
import request from "supertest"
import { app } from "../app"
import { Crop, ExtendedCrop } from "../types/crop-types"
import { toBeOneOf } from 'jest-extended'
import { StatusResponse } from "../types/response-types"
expect.extend({ toBeOneOf })


let token: string

const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/


beforeEach(async () => {

  await seed(data)

  const auth = await request(app)
    .post("/api/login")
    .send({
      login: "carrot_king",
      password: "carrots123",
    })

  token = auth.body.token
})

afterAll(async () => {
  await seed(data)
  db.end()
})


describe("GET /api/crops/plot/:plot_id", () => {

  test("GET:200 Responds with an array of crop objects sorted by crop_id in descending order", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const sortedCrops = [...body.crops].sort((a: ExtendedCrop, b: ExtendedCrop) => {
      if (a.crop_id! < b.crop_id!) return 1
      if (a.crop_id! > b.crop_id!) return -1
      return 0
    })

    expect(body.crops).toEqual(sortedCrops)

    for (const crop of body.crops) {
      expect(crop).toMatchObject<ExtendedCrop>({
        crop_id: expect.any(Number),
        plot_id: 1,
        subdivision_id: expect.toBeOneOf([expect.any(Number), null]),
        name: expect.any(String),
        variety: expect.toBeOneOf([expect.any(String), null]),
        quantity: expect.toBeOneOf([expect.any(Number), null]),
        category: expect.any(String),
        date_planted: expect.toBeOneOf([expect.stringMatching(regex), null]),
        harvest_date: expect.toBeOneOf([expect.stringMatching(regex), null]),
        subdivision_name: expect.toBeOneOf([expect.any(String), null]),
        note_count: expect.any(Number),
        image_count: expect.any(Number)
      })
    }

    expect(body.count).toBe(4)
  })

  test("GET:200 Responds with an empty array when no crops are associated with the plot", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/4")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(Array.isArray(body.crops)).toBe(true)

    expect(body.crops).toHaveLength(0)

    expect(body.count).toBe(0)
  })

  test("GET:400 Responds with an error when the plot_id parameter is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("GET:403 Responds with an error when the authenticated user attempts to retrieve another user's crop data", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/2")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission to view crop data denied"
    })
  })

  test("GET:404 Responds with an error when the plot does not exist", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Plot not found"
    })
  })

  test("GET:404 When the parent plot is deleted, all child crops are also deleted", async () => {

    await request(app)
      .delete("/api/plots/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204)

    const { body } = await request(app)
      .get("/api/crops/plot/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Plot not found"
    })
  })

  test("GET:404 When the parent user is deleted, all child crops are also deleted", async () => {

    await request(app)
      .delete("/api/users/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204)

    const { body } = await request(app)
      .get("/api/crops/plot/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Plot not found"
    })
  })
})


describe("GET /api/crops/plot/:plot_id?name=", () => {

  test("GET:200 Responds with an array of crop objects filtered case-insensitively by name", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/1?name=ca")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const crop of body.crops) {
      expect(crop.name).toMatch(/ca/i)
    }

    expect(body.count).toBe(3)
  })

  test("GET:200 Returns an empty array when the value of name matches no results", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/1?name=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(Array.isArray(body.crops)).toBe(true)

    expect(body.crops).toHaveLength(0)

    expect(body.count).toBe(0)
  })
})


describe("GET /api/crops/plot/:plot_id?category=", () => {

  test("GET:200 Responds with an array of crop objects filtered case-insensitively by category", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/1?category=vegetables")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const crop of body.crops) {
      expect(crop.category).toBe("Vegetables")
    }

    expect(body.count).toBe(2)
  })

  test("GET:404 Responds with an error when the query value is invalid", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/1?category=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "No results found for that query"
    })
  })
})


describe("GET /api/crops/plot/:plot_id?name=&category=", () => {

  test("GET:200 Responds with an array of crop objects filtered case-insensitively by name and category", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/1?name=carrot&category=vegetables")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const crop of body.crops) {
      expect(crop.name).toMatch(/carrot/i)
      expect(crop.category).toBe("Vegetables")
    }

    expect(body.count).toBe(1)
  })
})


describe("GET /api/crops/plot/:plot_id?sort=", () => {

  test("GET:200 Responds with an array of crop objects sorted by name in ascending order", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/1?sort=name")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const sortedCrops = [...body.crops].sort((a: ExtendedCrop, b: ExtendedCrop) => {
      if (a.name > b.name) return 1
      if (a.name < b.name) return -1
      return 0
    })

    expect(body.crops).toEqual(sortedCrops)

    expect(body.count).toBe(4)
  })

  test("GET:200 Responds with an array of crop objects sorted by date_planted in descending order while filtering out null values", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/1?sort=date_planted")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const crop of body.crops) {
      expect(crop.date_planted).not.toBeNull()
    }

    const sortedCrops = [...body.crops].sort((a: ExtendedCrop, b: ExtendedCrop) => {
      if (a.date_planted! < b.date_planted!) return 1
      if (a.date_planted! > b.date_planted!) return -1
      return 0
    })

    expect(body.crops).toEqual(sortedCrops)

    expect(body.count).toBe(3)
  })

  test("GET:200 Responds with an array of crop objects sorted by harvest_date in descending order while filtering out null values", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/1?sort=harvest_date")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const crop of body.crops) {
      expect(crop.harvest_date).not.toBeNull()
    }

    const sortedCrops = [...body.crops].sort((a: ExtendedCrop, b: ExtendedCrop) => {
      if (a.harvest_date! < b.harvest_date!) return 1
      if (a.harvest_date! > b.harvest_date!) return -1
      return 0
    })

    expect(body.crops).toEqual(sortedCrops)

    expect(body.count).toBe(3)
  })

  test("GET:400 Responds with an error when passed an invalid sort value", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/1?sort=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid query value"
    })
  })
})


describe("GET /api/crops/plot/:plot_id?name=&sort=", () => {

  test("GET:200 Responds with an array of crop objects filtered by name and sorted by name in ascending order", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/1?name=ca&sort=name")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const crop of body.crops) {
      expect(crop.name).toMatch(/ca/i)
    }

    const sortedCrops = [...body.crops].sort((a: ExtendedCrop, b: ExtendedCrop) => {
      if (a.name > b.name) return 1
      if (a.name < b.name) return -1
      return 0
    })

    expect(body.crops).toEqual(sortedCrops)

    expect(body.count).toBe(3)
  })

  test("GET:200 Responds with an array of crop objects filtered by name and sorted by harvest_date in descending order while filtering out null values", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/1?name=ca&sort=harvest_date")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const crop of body.crops) {
      expect(crop.name).toMatch(/ca/i)
    }

    const sortedCrops = [...body.crops].sort((a: ExtendedCrop, b: ExtendedCrop) => {
      if (a.harvest_date! < b.harvest_date!) return 1
      if (a.harvest_date! > b.harvest_date!) return -1
      return 0
    })

    expect(body.crops).toEqual(sortedCrops)

    expect(body.count).toBe(2)
  })
})


describe("GET /api/crops/plot/:plot_id?order=", () => {

  test("GET:400 Responds with an error when passed an invalid order value", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/1?order=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid query value"
    })
  })
})


describe("GET /api/crops/plot/:plot_id?limit=", () => {

  test("GET:200 Responds with a limited array of crop objects associated with the plot", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/1?limit=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.crops).toHaveLength(2)

    expect(body.count).toBe(4)
  })

  test("GET:200 Responds with an array of all crops associated with the plot when the limit exceeds the total number of results", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/1?limit=20")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.crops).toHaveLength(4)

    expect(body.count).toBe(4)
  })

  test("GET:400 Responds with an error when the value of limit is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/1?limit=two")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })
})


describe("GET /api/crops/plot/:plot_id?page=", () => {

  test("GET:200 Responds with an array of crop objects associated with the plot beginning from the page set in the query parameter", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/1?limit=2&page=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.crops.map((crop: ExtendedCrop) => {
      return crop.crop_id
    })).toEqual([2, 1])

    expect(body.count).toBe(4)
  })

  test("GET:200 The page defaults to page one", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/1?limit=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.crops.map((crop: ExtendedCrop) => {
      return crop.crop_id
    })).toEqual([4, 3])

    expect(body.count).toBe(4)
  })

  test("GET:200 When there are fewer results on the final page, the response contains those results", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/1?limit=3&page=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.crops.map((crop: ExtendedCrop) => {
      return crop.crop_id
    })).toEqual([1])

    expect(body.count).toBe(4)
  })

  test("GET:400 Responds with an error when the value of page is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/1?limit=2&page=three")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("GET:404 Responds with an error when the page cannot be found", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/1?limit=2&page=3")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Page not found"
    })
  })

  test("GET:404 Responds with an error when the page cannot be found (multiple queries affecting total query result rows)", async () => {

    const { body } = await request(app)
      .get("/api/crops/plot/1?name=ca&sort=harvest_date&limit=2&page=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Page not found"
    })
  })
})


describe("POST /api/crops/plot/:plot_id", () => {

  test("POST:201 Responds with a new crop object, assigning plot_id and subdivision_id (null) automatically", async () => {

    const newCrop = {
      name: "Pear",
      variety: "Conference",
      category: "Fruits",
      quantity: 1,
      date_planted: new Date("2024-07-21"),
      harvest_date: new Date("2024-09-30")
    }

    const { body } = await request(app)
      .post("/api/crops/plot/1")
      .send(newCrop)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.crop).toMatchObject<Crop>({
      crop_id: 7,
      plot_id: 1,
      subdivision_id: null,
      name: "Pear",
      variety: "Conference",
      category: "Fruits",
      quantity: 1,
      date_planted: expect.toBeOneOf([expect.stringMatching(regex), null]),
      harvest_date: expect.toBeOneOf([expect.stringMatching(regex), null])
    })
  })

  test("POST:201 Assigns a null value to subdivision_id, variety, quantity, date_planted, and harvest_date when no value is provided", async () => {

    const newCrop = {
      name: "Pear",
      category: "Fruits"
    }

    const { body } = await request(app)
      .post("/api/crops/plot/1")
      .send(newCrop)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.crop).toMatchObject<Crop>({
      crop_id: 7,
      plot_id: 1,
      subdivision_id: null,
      name: "Pear",
      variety: null,
      category: "Fruits",
      quantity: null,
      date_planted: null,
      harvest_date: null
    })
  })

  test("POST:201 Ignores any unnecessary properties on the object", async () => {

    const newCrop = {
      name: "Pear",
      category: "Fruits",
      price: 100
    }

    const { body } = await request(app)
      .post("/api/crops/plot/1")
      .send(newCrop)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.crop).not.toHaveProperty("price")
  })

  test("POST:400 Responds with an error when passed a property with an invalid data type", async () => {

    const newCrop = {
      name: "Pear",
      category: "Fruits",
      quantity: "one",
    }

    const { body } = await request(app)
      .post("/api/crops/plot/1")
      .send(newCrop)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid text representation"
    })
  })

  test("POST:400 Responds with an error when a required property is missing from the request body", async () => {

    const newCrop = {
      category: "Fruits"
    }

    const { body } = await request(app)
      .post("/api/crops/plot/1")
      .send(newCrop)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Not null violation"
    })
  })

  test("POST:400 Responds with an error when passed an invalid crop category", async () => {

    const newCrop = {
      name: "Pear",
      category: "foobar"
    }

    const { body } = await request(app)
      .post("/api/crops/plot/1")
      .send(newCrop)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid crop category"
    })
  })

  test("POST:400 Responds with an error when the plot_id parameter is not a positive integer", async () => {

    const newCrop = {
      name: "Pear",
      category: "Fruits"
    }

    const { body } = await request(app)
      .post("/api/crops/plot/foobar")
      .send(newCrop)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("POST:403 Responds with an error when the authenticated user attempts to add a crop for another user", async () => {

    const newCrop = {
      name: "Pear",
      category: "Fruits"
    }

    const { body } = await request(app)
      .post("/api/crops/plot/2")
      .send(newCrop)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission to add crop denied"
    })
  })

  test("POST:404 Responds with an error when the plot does not exist", async () => {

    const newCrop = {
      name: "Pear",
      category: "Fruits"
    }

    const { body } = await request(app)
      .post("/api/crops/plot/999")
      .send(newCrop)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Plot not found"
    })
  })
})


describe("GET /api/crops/subdivision/:subdivision_id", () => {

  test("GET:200 Responds with an array of crop objects sorted by crop_id in descending order", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const sortedCrops = [...body.crops].sort((a: ExtendedCrop, b: ExtendedCrop) => {
      if (a.crop_id! < b.crop_id!) return 1
      if (a.crop_id! > b.crop_id!) return -1
      return 0
    })

    expect(body.crops).toEqual(sortedCrops)

    for (const crop of body.crops) {
      expect(crop).toMatchObject<ExtendedCrop>({
        crop_id: expect.any(Number),
        plot_id: 1,
        subdivision_id: expect.toBeOneOf([expect.any(Number), null]),
        name: expect.any(String),
        variety: expect.toBeOneOf([expect.any(String), null]),
        category: expect.any(String),
        quantity: expect.toBeOneOf([expect.any(Number), null]),
        date_planted: expect.toBeOneOf([expect.stringMatching(regex), null]),
        harvest_date: expect.toBeOneOf([expect.stringMatching(regex), null]),
        note_count: expect.any(Number),
        image_count: expect.any(Number)
      })
    }

    expect(body.count).toBe(2)
  })

  test("GET:200 Responds with an empty array when no crops are associated with the subdivision", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(Array.isArray(body.crops)).toBe(true)

    expect(body.crops).toHaveLength(0)

    expect(body.count).toBe(0)
  })

  test("GET:400 Responds with an error when the subdivision_id parameter is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("GET:403 Responds with an error when the authenticated user attempts to retrieve another user's crop data", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/4")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission to view crop data denied"
    })
  })

  test("GET:404 Responds with an error when the subdivision does not exist", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Subdivision not found"
    })
  })

  test("GET:404 When the parent subdivision is deleted, all child crops are also deleted", async () => {

    await request(app)
      .delete("/api/subdivisions/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204)

    const { body } = await request(app)
      .get("/api/crops/subdivision/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Subdivision not found"
    })
  })
})


describe("GET /api/crops/subdivision/:subdivision_id?name=", () => {

  test("GET:200 Responds with an array of crop objects filtered case-insensitively by name", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/1?name=car")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const crop of body.crops) {
      expect(crop.name).toMatch(/car/i)
    }

    expect(body.count).toBe(1)
  })

  test("GET:200 Returns an empty array when the value of name matches no results", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/1?name=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(Array.isArray(body.crops)).toBe(true)

    expect(body.crops).toHaveLength(0)

    expect(body.count).toBe(0)
  })
})


describe("GET /api/crops/subdivision/:subdivision_id?category=", () => {

  test("GET:200 Responds with an array of crop objects filtered case-insensitively by category", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/1?category=vegetables")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const crop of body.crops) {
      expect(crop.category).toBe("Vegetables")
    }

    expect(body.count).toBe(1)
  })

  test("GET:404 Responds with an error when the query value is invalid", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/1?category=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "No results found for that query"
    })
  })
})


describe("GET /api/crops/subdivision/:subdivision_id?name=&category=", () => {

  test("GET:200 Responds with an array of crop objects filtered case-insensitively by name and category", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/1?name=carrot&category=vegetables")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const crop of body.crops) {
      expect(crop.name).toMatch(/carrot/i)
      expect(crop.category).toBe("Vegetables")
    }

    expect(body.count).toBe(1)
  })
})


describe("GET /api/crops/subdivision/:subdivision_id?sort=", () => {

  test("GET:200 Responds with an array of crop objects sorted by name in ascending order", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/1?sort=name")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const sortedCrops = [...body.crops].sort((a: ExtendedCrop, b: ExtendedCrop) => {
      if (a.name > b.name) return 1
      if (a.name < b.name) return -1
      return 0
    })

    expect(body.crops).toEqual(sortedCrops)

    expect(body.count).toBe(2)
  })

  test("GET:200 Responds with an array of crop objects sorted by date_planted in descending order while filtering out null values", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/1?sort=date_planted")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const crop of body.crops) {
      expect(crop.date_planted).not.toBeNull()
    }

    const sortedCrops = [...body.crops].sort((a: ExtendedCrop, b: ExtendedCrop) => {
      if (a.date_planted! < b.date_planted!) return 1
      if (a.date_planted! > b.date_planted!) return -1
      return 0
    })

    expect(body.crops).toEqual(sortedCrops)

    expect(body.count).toBe(2)
  })

  test("GET:200 Responds with an array of crop objects sorted by harvest_date in descending order while filtering out null values", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/1?sort=harvest_date")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const crop of body.crops) {
      expect(crop.date_planted).not.toBeNull()
    }

    const sortedCrops = [...body.crops].sort((a: ExtendedCrop, b: ExtendedCrop) => {
      if (a.harvest_date! < b.harvest_date!) return 1
      if (a.harvest_date! > b.harvest_date!) return -1
      return 0
    })

    expect(body.crops).toEqual(sortedCrops)

    expect(body.count).toBe(2)
  })

  test("GET:400 Responds with an error when passed an invalid sort value", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/1?sort=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid query value"
    })
  })
})


describe("GET /api/crops/subdivision/:subdivision_id?name=&sort=", () => {

  test("GET:200 Responds with an array of crop objects filtered by name and sorted by name in ascending order", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/1?name=car&sort=name")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const crop of body.crops) {
      expect(crop.name).toMatch(/car/i)
    }

    const sortedCrops = [...body.crops].sort((a: ExtendedCrop, b: ExtendedCrop) => {
      if (a.name > b.name) return 1
      if (a.name < b.name) return -1
      return 0
    })

    expect(body.crops).toEqual(sortedCrops)

    expect(body.count).toBe(1)
  })

  test("GET:200 Responds with an array of crop objects filtered by name and sorted by harvest_date in descending order while filtering out null values", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/1?name=car&sort=harvest_date")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const crop of body.crops) {
      expect(crop.name).toMatch(/car/i)
    }

    const sortedCrops = [...body.crops].sort((a: ExtendedCrop, b: ExtendedCrop) => {
      if (a.harvest_date! < b.harvest_date!) return 1
      if (a.harvest_date! > b.harvest_date!) return -1
      return 0
    })

    expect(body.crops).toEqual(sortedCrops)

    expect(body.count).toBe(1)
  })
})


describe("GET /api/crops/subdivision/:subdivision_id?order=", () => {

  test("GET:400 Responds with an error when passed an invalid order value", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/1?order=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid query value"
    })
  })
})


describe("GET /api/crops/subdivision/:subdivision_id?limit=", () => {

  test("GET:200 Responds with a limited array of crop objects associated with the subdivision", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/1?limit=1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.crops).toHaveLength(1)

    expect(body.count).toBe(2)
  })

  test("GET:200 Responds with an array of all crops associated with the subdivision when the limit exceeds the total number of results", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/1?limit=20")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.crops).toHaveLength(2)

    expect(body.count).toBe(2)
  })

  test("GET:400 Responds with an error when the value of limit is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/1?limit=two")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })
})


describe("GET /api/crops/subdivision/:subdivision_id?page=", () => {

  test("GET:200 Responds with an array of crop objects associated with the plot beginning from the page set in the query parameter", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/1?limit=1&page=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.crops.map((crop: ExtendedCrop) => {
      return crop.crop_id
    })).toEqual([1])

    expect(body.count).toBe(2)
  })

  test("GET:200 The page defaults to page one", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/1?limit=1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.crops.map((crop: ExtendedCrop) => {
      return crop.crop_id
    })).toEqual([4])

    expect(body.count).toBe(2)
  })

  test("GET:400 Responds with an error when the value of page is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/1?limit=1&page=three")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("GET:404 Responds with an error when the page cannot be found", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/1?limit=1&page=3")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Page not found"
    })
  })

  test("GET:404 Responds with an error when the page cannot be found (multiple queries affecting total query result rows)", async () => {

    const { body } = await request(app)
      .get("/api/crops/subdivision/1?name=car&sort=harvest_date&limit=1&page=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Page not found"
    })
  })
})


describe("POST /api/crops/subdivision/:subdivision_id", () => {

  test("POST:201 Responds with a new crop object, assigning plot_id and subdivision_id automatically", async () => {

    const newCrop = {
      name: "Pear",
      variety: "Conference",
      category: "Fruits",
      quantity: 1,
      date_planted: new Date("2024-07-21"),
      harvest_date: new Date("2024-09-30")
    }

    const { body } = await request(app)
      .post("/api/crops/subdivision/1")
      .send(newCrop)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.crop).toMatchObject<Crop>({
      crop_id: 7,
      plot_id: 1,
      subdivision_id: 1,
      name: "Pear",
      variety: "Conference",
      category: "Fruits",
      quantity: 1,
      date_planted: expect.toBeOneOf([expect.stringMatching(regex), null]),
      harvest_date: expect.toBeOneOf([expect.stringMatching(regex), null])
    })
  })

  test("POST:201 Assigns a null value to variety, quantity, date_planted, and harvest_date when no value is provided", async () => {

    const newCrop = {
      name: "Pear",
      category: "Fruits"
    }

    const { body } = await request(app)
      .post("/api/crops/subdivision/1")
      .send(newCrop)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.crop).toMatchObject<Crop>({
      crop_id: 7,
      plot_id: 1,
      subdivision_id: 1,
      name: "Pear",
      variety: null,
      category: "Fruits",
      quantity: null,
      date_planted: null,
      harvest_date: null
    })
  })

  test("POST:201 Ignores any unnecessary properties on the object", async () => {

    const newCrop = {
      name: "Pear",
      category: "Fruits",
      price: 100
    }

    const { body } = await request(app)
      .post("/api/crops/subdivision/1")
      .send(newCrop)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.crop).not.toHaveProperty("price")
  })

  test("POST:400 Responds with an error when passed a property with an invalid data type", async () => {

    const newCrop = {
      name: "Pear",
      category: "Fruits",
      quantity: "one",
    }

    const { body } = await request(app)
      .post("/api/crops/subdivision/1")
      .send(newCrop)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid text representation"
    })
  })

  test("POST:400 Responds with an error when a required property is missing from the request body", async () => {

    const newCrop = {
      category: "Fruits"
    }

    const { body } = await request(app)
      .post("/api/crops/subdivision/1")
      .send(newCrop)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Not null violation"
    })
  })

  test("POST:400 Responds with an error when passed an invalid crop category", async () => {

    const newCrop = {
      name: "Pear",
      category: "foobar"
    }

    const { body } = await request(app)
      .post("/api/crops/subdivision/1")
      .send(newCrop)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid crop category"
    })
  })

  test("POST:400 Responds with an error when the subdivision_id parameter is not a positive integer", async () => {

    const newCrop = {
      name: "Pear",
      category: "Fruits"
    }

    const { body } = await request(app)
      .post("/api/crops/subdivision/foobar")
      .send(newCrop)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("POST:403 Responds with an error when the authenticated user attempts to add a crop for another user", async () => {

    const newCrop = {
      name: "Pear",
      category: "Fruits"
    }

    const { body } = await request(app)
      .post("/api/crops/subdivision/4")
      .send(newCrop)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission to add crop denied"
    })
  })

  test("POST:404 Responds with an error when the subdivision does not exist", async () => {

    const newCrop = {
      name: "Pear",
      category: "Fruits"
    }

    const { body } = await request(app)
      .post("/api/crops/subdivision/999")
      .send(newCrop)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Subdivision not found"
    })
  })
})


describe("GET /api/crops/:crop_id", () => {

  test("GET:200 Responds with a crop object", async () => {

    const { body } = await request(app)
      .get("/api/crops/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.crop).toMatchObject<ExtendedCrop>({
      crop_id: 1,
      plot_id: 1,
      subdivision_id: 1,
      name: "Carrot",
      variety: null,
      category: "Vegetables",
      quantity: 20,
      date_planted: expect.stringMatching(regex),
      harvest_date: expect.stringMatching(regex),
      plot_name: "John's Garden",
      subdivision_name: "Root Vegetable Bed",
      note_count: 2,
      image_count: 2
    })
  })

  test("GET:400 Responds with an error when the crop_id parameter is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/crops/foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("GET:403 Responds with an error when the crop does not belong to the authenticated user", async () => {

    const { body } = await request(app)
      .get("/api/crops/5")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission to view crop data denied"
    })
  })

  test("GET:404 Responds with an error when the crop does not exist", async () => {

    const { body } = await request(app)
      .get("/api/crops/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Crop not found"
    })
  })
})


describe("PATCH /api/crops/:crop_id", () => {

  test("PATCH:200 Responds with an updated crop object", async () => {

    const newDetails = {
      name: "Carrots",
      variety: "Chantenay",
      category: "Vegetables",
      quantity: 25,
      date_planted: new Date("2024-06-20"),
      harvest_date: new Date("2024-09-30")
    }

    const { body } = await request(app)
      .patch("/api/crops/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.crop).toMatchObject<Crop>({
      crop_id: 1,
      plot_id: 1,
      subdivision_id: 1,
      name: "Carrots",
      variety: "Chantenay",
      category: "Vegetables",
      quantity: 25,
      date_planted: expect.stringMatching(regex),
      harvest_date: expect.stringMatching(regex)
    })
  })

  test("PATCH:400 Responds with an error when a required property is missing from the request body", async () => {

    const newDetails = {
      variety: "Chantenay",
      category: "Vegetables",
      quantity: 25,
      date_planted: new Date("2024-06-20"),
      harvest_date: new Date("2024-09-30")
    }

    const { body } = await request(app)
      .patch("/api/crops/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Not null violation"
    })
  })

  test("PATCH:400 Responds with an error when passed a property with an invalid data type", async () => {

    const newDetails = {
      name: "Carrots",
      variety: "Chantenay",
      category: "Vegetables",
      quantity: "twenty",
      date_planted: new Date("2024-06-20"),
      harvest_date: new Date("2024-09-30")
    }

    const { body } = await request(app)
      .patch("/api/crops/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid text representation"
    })
  })

  test("PATCH:400 Responds with an error when passed an invalid crop category", async () => {

    const newDetails = {
      name: "Carrots",
      variety: "Chantenay",
      category: "foobar",
      quantity: 25,
      date_planted: new Date("2024-06-20"),
      harvest_date: new Date("2024-09-30")
    }

    const { body } = await request(app)
      .patch("/api/crops/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid crop category"
    })
  })

  test("PATCH:400 Responds with an error whe the crop_id parameter is not a positive integer", async () => {

    const newDetails = {
      name: "Carrots",
      variety: "Chantenay",
      category: "Vegetables",
      quantity: 25,
      date_planted: new Date("2024-06-20"),
      harvest_date: new Date("2024-09-30")
    }

    const { body } = await request(app)
      .patch("/api/crops/foobar")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("PATCH:403 Responds with an error when the crop does not belong to the authenticated user", async () => {

    const newDetails = {
      name: "Carrots",
      variety: "Chantenay",
      category: "Vegetables",
      quantity: 25,
      date_planted: new Date("2024-06-20"),
      harvest_date: new Date("2024-09-30")
    }

    const { body } = await request(app)
      .patch("/api/crops/5")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission to edit crop data denied"
    })
  })

  test("PATCH:404 Responds with an error when the crop does not exist", async () => {

    const newDetails = {
      name: "Carrots",
      variety: "Chantenay",
      category: "Vegetables",
      quantity: 25,
      date_planted: new Date("2024-06-20"),
      harvest_date: new Date("2024-09-30")
    }

    const { body } = await request(app)
      .patch("/api/crops/999")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Crop not found"
    })
  })
})


describe("DELETE /api/crops/:crop_id", () => {

  test("DELETE:204 Deletes the crop with the given crop ID", async () => {

    await request(app)
      .delete("/api/crops/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204)

    const { body } = await request(app)
      .get("/api/crops/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Crop not found"
    })
  })

  test("DELETE:400 Responds with an error when the crop_id parameter is not a positive integer", async () => {

    const { body } = await request(app)
      .delete("/api/crops/foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("DELETE:403 Responds with an error when the authenticated user attempts to delete another user's crop", async () => {

    const { body } = await request(app)
      .delete("/api/crops/5")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission to delete crop data denied"
    })
  })

  test("DELETE:404 Responds with an error when the crop does not exist", async () => {

    const { body } = await request(app)
      .delete("/api/crops/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Crop not found"
    })
  })
})


describe("PATCH /api/crops/:crop_id/plot", () => {

  test("PATCH:200 Responds with an updated crop object, assigning a null value to subdivision_id automatically", async () => {

    const newPlot = {
      plot_id: 3
    }

    const { body } = await request(app)
      .patch("/api/crops/1/plot")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.crop).toMatchObject<Crop>({
      crop_id: 1,
      plot_id: 3,
      subdivision_id: null,
      name: "Carrot",
      variety: null,
      category: "Vegetables",
      quantity: 20,
      date_planted: expect.toBeOneOf([expect.stringMatching(regex), null]),
      harvest_date: expect.toBeOneOf([expect.stringMatching(regex), null])
    })
  })

  test("PATCH:400 Responds with an error when a required property is missing from the request body", async () => {

    const newPlot = {}

    const { body } = await request(app)
      .patch("/api/crops/1/plot")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Not null violation"
    })
  })

  test("PATCH:400 Responds with an error when passed a property with an invalid data type", async () => {

    const newPlot = {
      plot_id: "three"
    }

    const { body } = await request(app)
      .patch("/api/crops/1/plot")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid text representation"
    })
  })

  test("PATCH:400 Responds with an error when the crop_id parameter is not a positive integer", async () => {

    const newPlot = {
      plot_id: 3
    }

    const { body } = await request(app)
      .patch("/api/crops/foobar/plot")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("PATCH:403 Responds with an error when the crop does not belong to the authenticated user", async () => {

    const newPlot = {
      plot_id: 3
    }

    const { body } = await request(app)
      .patch("/api/crops/5/plot")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission to move crop denied"
    })
  })

  test("PATCH:403 Responds with an error when the target plot does not belong to the authenticated user", async () => {

    const newPlot = {
      plot_id: 2
    }

    const { body } = await request(app)
      .patch("/api/crops/1/plot")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission to move crop denied"
    })
  })

  test("PATCH:404 Responds with an error when the crop does not exist", async () => {

    const newPlot = {
      plot_id: 3
    }

    const { body } = await request(app)
      .patch("/api/crops/999/plot")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Crop not found"
    })
  })

  test("PATCH:404 Responds with an error when the target plot does not exist", async () => {

    const newPlot = {
      plot_id: 999
    }

    const { body } = await request(app)
      .patch("/api/crops/1/plot")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Plot not found"
    })
  })
})


describe("PATCH /api/crops/:crop_id/subdivision", () => {

  test("PATCH:200 Responds with an updated crop object", async () => {

    const newSubdivision = {
      subdivision_id: 2
    }

    const { body } = await request(app)
      .patch("/api/crops/1/subdivision")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.crop).toMatchObject<Crop>({
      crop_id: 1,
      plot_id: 1,
      subdivision_id: 2,
      name: "Carrot",
      variety: null,
      category: "Vegetables",
      quantity: 20,
      date_planted: expect.toBeOneOf([expect.stringMatching(regex), null]),
      harvest_date: expect.toBeOneOf([expect.stringMatching(regex), null])
    })
  })

  test("PATCH:200 Sets the value of subdivision_id to null if no value is provided", async () => {

    const newSubdivision = {}

    const { body } = await request(app)
      .patch("/api/crops/1/subdivision")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.crop).toMatchObject<Crop>({
      crop_id: 1,
      plot_id: 1,
      subdivision_id: null,
      name: "Carrot",
      variety: null,
      category: "Vegetables",
      quantity: 20,
      date_planted: expect.toBeOneOf([expect.stringMatching(regex), null]),
      harvest_date: expect.toBeOneOf([expect.stringMatching(regex), null])
    })
  })

  test("PATCH:400 Responds with an error when passed a property with an invalid data type", async () => {

    const newSubdivision = {
      subdivision_id: "two"
    }

    const { body } = await request(app)
      .patch("/api/crops/1/subdivision")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid text representation"
    })
  })

  test("PATCH:400 Responds with an error when the crop_id parameter is not a positive integer", async () => {

    const newSubdivision = {
      subdivision_id: 2
    }

    const { body } = await request(app)
      .patch("/api/crops/foobar/subdivision")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("PATCH:400 Responds with an error when the target subdivision belongs to the authenticated user but is not a subdivision of the current plot", async () => {

    const newSubdivision = {
      subdivision_id: 5
    }

    const { body } = await request(app)
      .patch("/api/crops/1/subdivision")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid subdivision of current plot"
    })
  })

  test("PATCH:403 Responds with an error when the crop does not belong to the authenticated user", async () => {

    const newSubdivision = {
      subdivision_id: 2
    }

    const { body } = await request(app)
      .patch("/api/crops/5/subdivision")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission to move crop denied"
    })
  })

  test("PATCH:403 Responds with an error when the target subdivision does not belong to the authenticated user", async () => {

    const newSubdivision = {
      subdivision_id: 4
    }

    const { body } = await request(app)
      .patch("/api/crops/1/subdivision")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission to move crop denied"
    })
  })

  test("PATCH:404 Responds with an error when the crop does not exist", async () => {

    const newSubdivision = {
      subdivision_id: 2
    }

    const { body } = await request(app)
      .patch("/api/crops/999/subdivision")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Crop not found"
    })
  })

  test("PATCH:404 Responds with an error when the target subdivision does not exist", async () => {

    const newSubdivision = {
      subdivision_id: 999
    }

    const { body } = await request(app)
      .patch("/api/crops/1/subdivision")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Subdivision not found"
    })
  })
})
