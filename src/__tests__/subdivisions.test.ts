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


describe("GET /api/subdivisions/:plot_id?type=", () => {

  test("GET:200 Responds with an array of subdivision objects filtered by type", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/1?type=bed")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.subdivisions.every((subdivision: Subdivision) => {
      return subdivision.type === "bed"
    })).toBe(true)
  })

  test("GET:404 Responds with an error message when the query value is invalid", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/1?type=castle")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "No results found for that query"
    })
  })
})


describe("POST /api/subdivisions/:plot_id", () => {

  test("POST:201 Responds with a new subdivision object", async () => {

    const newSubdivision = {
      plot_id: 1,
      name: "Wildflowers",
      type: "flowerbed",
      description: "Foxgloves and bluebells",
      area: 2
    }

    const { body } = await request(app)
      .post("/api/subdivisions/1")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.subdivision).toMatchObject({
      subdivision_id: 5,
      plot_id: 1,
      name: "Wildflowers",
      type: "flowerbed",
      description: "Foxgloves and bluebells",
      area: 2
    })
  })

  test("POST:201 Assigns a null value to 'area' when no value is provided", async () => {

    const newSubdivision = {
      plot_id: 1,
      name: "Wildflowers",
      type: "flowerbed",
      description: "Foxgloves and bluebells"
    }

    const { body } = await request(app)
      .post("/api/subdivisions/1")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.subdivision.area).toBeNull()
  })

  test("POST:201 Ignores any unnecessary properties on the object", async () => {

    const newSubdivision = {
      plot_id: 1,
      name: "Wildflowers",
      type: "flowerbed",
      description: "Foxgloves and bluebells",
      area: 2,
      price: 100
    }

    const { body } = await request(app)
      .post("/api/subdivisions/1")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.subdivision).not.toHaveProperty("price")
  })

  test("POST:400 Responds with an error when passed a property with an invalid data type", async () => {

    const newSubdivision = {
      plot_id: 1,
      name: "Wildflowers",
      type: "flowerbed",
      description: "Foxgloves and bluebells",
      area: "two metres squared"
    }

    const { body } = await request(app)
      .post("/api/subdivisions/1")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject({
      message: "Bad Request",
      details: "Invalid text representation"
    })
  })

  test("POST:400 Responds with an error when a required property is missing from the request body", async () => {

    const newSubdivision = {
      plot_id: 1,
      type: "flowerbed",
      description: "Foxgloves and bluebells",
      area: 2
    }

    const { body } = await request(app)
      .post("/api/subdivisions/1")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject({
      message: "Bad Request",
      details: "Not null violation"
    })
  })

  test("POST:400 Responds with an error when passed an invalid subdivision type", async () => {

    const newSubdivision = {
      plot_id: 1,
      name: "Wildflowers",
      type: "garage",
      description: "Foxgloves and bluebells",
      area: 2
    }

    const { body } = await request(app)
      .post("/api/subdivisions/1")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject({
      message: "Bad Request",
      details: "Invalid subdivision type"
    })
  })

  test("POST:403 Responds with a warning when the authenticated user attempts to create a subdivision for another user", async () => {

    const newSubdivision = {
      plot_id: 1,
      name: "Wildflowers",
      type: "flowerbed",
      description: "Foxgloves and bluebells",
      area: 2
    }

    const { body } = await request(app)
      .post("/api/subdivisions/2")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject({
      message: "Forbidden",
      details: "Permission to create subdivision denied"
    })
  })

  test("POST:403 Responds with a warning when the authenticated user attempts to create a subdivision for another user (forbidden plot_id on request body)", async () => {

    const newSubdivision = {
      plot_id: 2,
      name: "Wildflowers",
      type: "flowerbed",
      description: "Foxgloves and bluebells",
      area: 2
    }

    const { body } = await request(app)
      .post("/api/subdivisions/1")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject({
      message: "Forbidden",
      details: "Permission to create subdivision denied"
    })
  })

  test("POST:404 Responds with an error message when the plot_id does not exist", async () => {

    const newSubdivision = {
      plot_id: 1,
      name: "Wildflowers",
      type: "flowerbed",
      description: "Foxgloves and bluebells",
      area: 2
    }

    const { body } = await request(app)
      .post("/api/subdivisions/999")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "Plot not found"
    })
  })

  test("POST:404 Responds with an error message when the plot_id is not a number", async () => {

    const newSubdivision = {
      plot_id: 1,
      name: "Wildflowers",
      type: "flowerbed",
      description: "Foxgloves and bluebells",
      area: 2
    }

    const { body } = await request(app)
      .post("/api/subdivisions/example")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "Plot not found"
    })
  })

  test("POST:409 Responds with an error message when the subdivision name already exists for one of the given user's subdivisions of that plot", async () => {

    const newSubdivision = {
      plot_id: 1,
      name: "Onion Bed",
      type: "flowerbed",
      description: "Foxgloves and bluebells",
      area: 2
    }

    const { body } = await request(app)
      .post("/api/subdivisions/1")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(409)

    expect(body).toMatchObject({
      message: "Conflict",
      details: "Subdivision name already exists"
    })
  })
})


describe("GET /api/subdivisions/subdivision/:subdivision_id", () => {

  test("GET:200 Responds with a subdivision object", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/subdivision/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.subdivision).toMatchObject({
      subdivision_id: 1,
      plot_id: 1,
      name: "Root Vegetable Bed",
      type: "bed",
      description: "Carrots, beetroots, and parsnips",
      area: 10
    })
  })

  test("GET:403 Responds with a warning when the subdivision does not belong to the authenticated user", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/subdivision/4")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject({
      message: "Forbidden",
      details: "Permission to view subdivision data denied"
    })
  })

  test("GET:404 Responds with an error message when the subdivision does not exist", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/subdivision/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "Subdivision not found"
    })
  })

  test("GET:404 Responds with an error message when the subdivision is not a number", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/subdivision/example")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "Subdivision not found"
    })
  })
})
