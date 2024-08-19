import data from "../db/data/test-data/test-index"
import { db } from "../db"
import { seed } from "../db/seeding/seed"
import request from "supertest"
import { app } from "../app"
import { toBeOneOf } from 'jest-extended'
import { ExtendedSubdivision, Subdivision } from "../types/subdivision-types"
import { StatusResponse } from "../types/response-types"
expect.extend({ toBeOneOf })


let token: string


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


describe("GET /api/subdivisions/plot/:plot_id", () => {

  test("GET:200 Responds with an array of subdivision objects sorted by subdivision_id in descending order", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plot/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const sortedSubdivisions = [...body.subdivisions].sort((a: ExtendedSubdivision, b: ExtendedSubdivision) => {
      if (a.subdivision_id! < b.subdivision_id!) return 1
      if (a.subdivision_id! > b.subdivision_id!) return -1
      return 0
    })

    expect(body.subdivisions).toEqual(sortedSubdivisions)

    for (const subdivision of body.subdivisions) {
      expect(subdivision).toMatchObject<ExtendedSubdivision>({
        subdivision_id: expect.any(Number),
        plot_id: 1,
        name: expect.any(String),
        type: expect.any(String),
        description: expect.any(String),
        area: expect.toBeOneOf([expect.any(Number), null]),
        image_count: expect.any(Number),
        crop_count: expect.any(Number),
        issue_count: expect.any(Number),
        job_count: expect.any(Number)
      })
    }

    expect(body.count).toBe(3)
  })

  test("GET:200 Responds with an empty array when no subdivisions are associated with the plot", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plot/3")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(Array.isArray(body.subdivisions)).toBe(true)

    expect(body.subdivisions).toHaveLength(0)

    expect(body.count).toBe(0)
  })

  test("GET:400 Responds with an error when the plot_id parameter is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plot/foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid parameter"
    })
  })

  test("GET:403 Responds with an error when the authenticated user attempts to retrieve another user's subdivision data", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plot/2")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission to view plot subdivision data denied"
    })
  })

  test("GET:404 Responds with an error when the plot does not exist", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plot/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Plot not found"
    })
  })

  test("GET:404 When the parent plot is deleted, all child subdivisions are also deleted", async () => {

    await request(app)
      .delete("/api/plots/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204)

    const { body } = await request(app)
      .get("/api/subdivisions/plot/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Plot not found"
    })
  })

  test("GET:404 When the parent user is deleted, all child subdivisions are also deleted", async () => {

    await request(app)
      .delete("/api/users/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204)

    const { body } = await request(app)
      .get("/api/subdivisions/plot/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Plot not found"
    })
  })
})


describe("GET /api/subdivisions/plot/:plot_id?type=", () => {

  test("GET:200 Responds with an array of subdivision objects filtered case-insensitively by type", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plot/1?type=bed")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.subdivisions).toHaveLength(2)

    for (const subdivision of body.subdivisions) {
      expect(subdivision.type).toBe("Bed")
    }

    expect(body.count).toBe(2)
  })

  test("GET:404 Responds with an error when the query value is invalid", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plot/1?type=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "No results found for that query"
    })
  })
})


describe("GET /api/subdivisions/plot/:plot_id?name=", () => {

  test("GET:200 Responds with an array of subdivision objects filtered by name", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plot/1?name=bed")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const subdivision of body.subdivisions) {
      expect(subdivision.name).toMatch(/bed/i)
    }

    expect(body.count).toBe(2)
  })

  test("GET:200 Filtered results are case-insensitive", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plot/1?name=BED")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const subdivision of body.subdivisions) {
      expect(subdivision.name).toMatch(/bed/i)
    }

    expect(body.count).toBe(2)
  })

  test("GET:200 Returns an empty array when the value of name matches no results", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plot/1?name=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(Array.isArray(body.subdivisions)).toBe(true)

    expect(body.subdivisions).toHaveLength(0)

    expect(body.count).toBe(0)
  })
})


describe("GET /api/subdivisions/plot/:plot_id?type=&name=", () => {

  test("GET:200 Responds with an array of subdivision objects filtered by type and name", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plot/1?type=bed&name=onion")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const subdivision of body.subdivisions) {
      expect(subdivision.type).toBe("Bed")
      expect(subdivision.name).toMatch(/onion/i)
    }

    expect(body.count).toBe(1)
  })
})


describe("GET /api/subdivisions/plot/:plot_id?sort=", () => {

  test("GET:200 Responds with an array of subdivision objects sorted by name in ascending order", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plot/1?sort=name")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const sortedSubdivisions = [...body.subdivisions].sort((a: ExtendedSubdivision, b: ExtendedSubdivision) => {
      if (a.name! > b.name!) return 1
      if (a.name! < b.name!) return -1
      return 0
    })

    expect(body.subdivisions).toEqual(sortedSubdivisions)

    expect(body.count).toBe(3)
  })

  test("GET:400 Responds with an error when passed an invalid sort value", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plot/1?sort=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid query value"
    })
  })
})


describe("GET /api/subdivisions/plot/:plot_id?order=", () => {

  test("GET:400 Responds with an error when passed an invalid order value", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plot/1?order=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid query value"
    })
  })
})


describe("GET /api/subdivisions/plot/:plot_id?limit=", () => {

  test("GET:200 Responds with a limited array of subdivision objects associated with the plot", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plot/1?limit=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.subdivisions).toHaveLength(2)

    expect(body.count).toBe(3)
  })

  test("GET:200 Responds with an array of all subdivisions associated with the plot when the limit exceeds the total number of results", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plot/1?limit=20")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.subdivisions).toHaveLength(3)

    expect(body.count).toBe(3)
  })

  test("GET:400 Responds with an error when the value of limit is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plot/1?limit=two")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid parameter"
    })
  })
})


describe("GET /api/subdivisions/plot/:plot_id?page=", () => {

  test("GET:200 Responds with an array of subdivision objects associated with the plot beginning from the page set in the query parameter", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plot/1?limit=2&page=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.subdivisions.map((subdivision: ExtendedSubdivision) => {
      return subdivision.subdivision_id
    })).toEqual([1])

    expect(body.count).toBe(3)
  })

  test("GET:200 The page defaults to page one", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plot/1?limit=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.subdivisions.map((subdivision: ExtendedSubdivision) => {
      return subdivision.subdivision_id
    })).toEqual([3, 2])

    expect(body.count).toBe(3)
  })

  test("GET:400 Responds with an error when the value of page is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plot/1?limit=2&page=two")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid parameter"
    })
  })

  test("GET:404 Responds with an error when the page cannot be found", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plot/1?limit=2&page=3")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Page not found"
    })
  })

  test("GET:404 Responds with an error when the page cannot be found (multiple queries affecting total query result rows)", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plot/1?type=bed&name=onion&limit=1&page=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Page not found"
    })
  })
})


describe("POST /api/subdivisions/plot/:plot_id", () => {

  test("POST:201 Responds with a new subdivision object, assigning plot_id automatically", async () => {

    const newSubdivision = {
      name: "Wildflowers",
      type: "Flowerbed",
      description: "Foxgloves and bluebells",
      area: 2
    }

    const { body } = await request(app)
      .post("/api/subdivisions/plot/1")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.subdivision).toMatchObject<Subdivision>({
      subdivision_id: 5,
      plot_id: 1,
      name: "Wildflowers",
      type: "Flowerbed",
      description: "Foxgloves and bluebells",
      area: 2
    })
  })

  test("POST:201 Assigns a null value to area when no value is provided", async () => {

    const newSubdivision = {
      name: "Wildflowers",
      type: "Flowerbed",
      description: "Foxgloves and bluebells"
    }

    const { body } = await request(app)
      .post("/api/subdivisions/plot/1")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.subdivision.area).toBeNull()
  })

  test("POST:201 Ignores any unnecessary properties on the object", async () => {

    const newSubdivision = {
      name: "Wildflowers",
      type: "Flowerbed",
      description: "Foxgloves and bluebells",
      area: 2,
      price: 100
    }

    const { body } = await request(app)
      .post("/api/subdivisions/plot/1")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.subdivision).not.toHaveProperty("price")
  })

  test("POST:400 Responds with an error when passed a property with an invalid data type", async () => {

    const newSubdivision = {
      name: "Wildflowers",
      type: "Flowerbed",
      description: "Foxgloves and bluebells",
      area: "two metres squared"
    }

    const { body } = await request(app)
      .post("/api/subdivisions/plot/1")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid text representation"
    })
  })

  test("POST:400 Responds with an error when a required property is missing from the request body", async () => {

    const newSubdivision = {
      type: "Flowerbed",
      description: "Foxgloves and bluebells",
      area: 2
    }

    const { body } = await request(app)
      .post("/api/subdivisions/plot/1")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Not null violation"
    })
  })

  test("POST:400 Responds with an error when passed an invalid subdivision type", async () => {

    const newSubdivision = {
      name: "Wildflowers",
      type: "foobar",
      description: "Foxgloves and bluebells",
      area: 2
    }

    const { body } = await request(app)
      .post("/api/subdivisions/plot/1")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid subdivision type"
    })
  })

  test("POST:400 Responds with an error when the plot_id parameter is not a positive integer", async () => {

    const newSubdivision = {
      name: "Wildflowers",
      type: "Flowerbed",
      description: "Foxgloves and bluebells",
      area: 2
    }

    const { body } = await request(app)
      .post("/api/subdivisions/plot/foobar")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid parameter"
    })
  })

  test("POST:403 Responds with an error when the authenticated user attempts to create a subdivision for another user", async () => {

    const newSubdivision = {
      name: "Wildflowers",
      type: "Flowerbed",
      description: "Foxgloves and bluebells",
      area: 2
    }

    const { body } = await request(app)
      .post("/api/subdivisions/plot/2")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission to create subdivision denied"
    })
  })

  test("POST:404 Responds with an error when the plot does not exist", async () => {

    const newSubdivision = {
      name: "Wildflowers",
      type: "Flowerbed",
      description: "Foxgloves and bluebells",
      area: 2
    }

    const { body } = await request(app)
      .post("/api/subdivisions/plot/999")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Plot not found"
    })
  })

  test("POST:409 Responds with an error when the subdivision name already exists for a subdivision of the given plot", async () => {

    const newSubdivision = {
      name: "Onion Bed",
      type: "Flowerbed",
      description: "Foxgloves and bluebells",
      area: 2
    }

    const { body } = await request(app)
      .post("/api/subdivisions/plot/1")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(409)

    expect(body).toMatchObject<StatusResponse>({
      message: "Conflict",
      details: "Subdivision name already exists"
    })
  })
})


describe("GET /api/subdivisions/:subdivision_id", () => {

  test("GET:200 Responds with a subdivision object", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.subdivision).toMatchObject<ExtendedSubdivision>({
      subdivision_id: 1,
      plot_id: 1,
      name: "Root Vegetable Bed",
      type: "Bed",
      description: "Carrots, beetroots, and parsnips",
      area: 10,
      plot_name: "John's Garden",
      image_count: 1,
      crop_count: 2,
      issue_count: 1,
      job_count: 1
    })
  })

  test("GET:400 Responds with an error when the subdivision_id parameter is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid parameter"
    })
  })

  test("GET:403 Responds with an error when the subdivision does not belong to the authenticated user", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/4")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission to view subdivision data denied"
    })
  })

  test("GET:404 Responds with an error when the subdivision does not exist", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Subdivision not found"
    })
  })
})


describe("PATCH /api/subdivisions/:subdivision_id", () => {

  test("PATCH:200 Responds with an updated subdivision object", async () => {

    const newDetails = {
      name: "Root Vegetable Patch",
      type: "Vegetable patch",
      description: "Turnips and radishes",
      area: 20
    }

    const { body } = await request(app)
      .patch("/api/subdivisions/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.subdivision).toMatchObject<Subdivision>({
      subdivision_id: 1,
      plot_id: 1,
      name: 'Root Vegetable Patch',
      type: 'Vegetable patch',
      description: 'Turnips and radishes',
      area: 20
    })
  })

  test("PATCH:200 Allows the request when the subdivision name remains unchanged (subdivision name conflict should only be raised in cases of duplication)", async () => {

    const newDetails = {
      name: "Root Vegetable Bed",
      type: "Vegetable patch",
      description: "Turnips and radishes",
      area: 20
    }

    const { body } = await request(app)
      .patch("/api/subdivisions/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.subdivision).toMatchObject<Subdivision>({
      subdivision_id: 1,
      plot_id: 1,
      name: 'Root Vegetable Bed',
      type: 'Vegetable patch',
      description: 'Turnips and radishes',
      area: 20
    })
  })

  test("PATCH:400 Responds with an error when a required property is missing from the request body", async () => {

    const newDetails = {
      type: "Vegetable patch",
      description: "Turnips and radishes",
      area: 20
    }

    const { body } = await request(app)
      .patch("/api/subdivisions/1")
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
      name: "Root Vegetable Patch",
      type: "Vegetable patch",
      description: "Turnips and radishes",
      area: "twenty"
    }

    const { body } = await request(app)
      .patch("/api/subdivisions/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid text representation"
    })
  })

  test("PATCH:400 Responds with an error when passed an invalid subdivision type", async () => {

    const newDetails = {
      name: "Root Vegetable Patch",
      type: "foobar",
      description: "Turnips and radishes",
      area: 20
    }

    const { body } = await request(app)
      .patch("/api/subdivisions/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid subdivision type"
    })
  })

  test("PATCH:400 Responds with an error when the subdivision_id parameter is not a positive integer", async () => {

    const newDetails = {
      name: "Root Vegetable Patch",
      type: "Vegetable patch",
      description: "Turnips and radishes",
      area: 20
    }

    const { body } = await request(app)
      .patch("/api/subdivisions/foobar")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid parameter"
    })
  })

  test("PATCH:403 Responds with an error when the subdivision does not belong to the authenticated user", async () => {

    const newDetails = {
      name: "Root Vegetable Patch",
      type: "Vegetable patch",
      description: "Turnips and radishes",
      area: 20
    }

    const { body } = await request(app)
      .patch("/api/subdivisions/4")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission to edit subdivision data denied"
    })
  })

  test("PATCH:404 Responds with an error when the subdivision does not exist", async () => {

    const newDetails = {
      name: "Root Vegetable Patch",
      type: "Vegetable patch",
      description: "Turnips and radishes",
      area: 20
    }

    const { body } = await request(app)
      .patch("/api/subdivisions/999")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Subdivision not found"
    })
  })

  test("PATCH:409 Responds with an error when the subdivision name already exists for a subdivision of the given plot", async () => {

    const newDetails = {
      name: "Onion Bed",
      type: "Bed",
      description: "Yellow and white onions",
      area: 20
    }

    const { body } = await request(app)
      .patch("/api/subdivisions/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(409)

    expect(body).toMatchObject<StatusResponse>({
      message: "Conflict",
      details: "Subdivision name already exists"
    })
  })
})


describe("DELETE /api/subdivisions/:subdivision_id", () => {

  test("DELETE:204 Deletes the subdivision with the given subdivision ID", async () => {

    await request(app)
      .delete("/api/subdivisions/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204)

    const { body } = await request(app)
      .get("/api/subdivisions/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Subdivision not found"
    })
  })

  test("DELETE:400 Responds with an error when the subdivision_id parameter is not a positive integer", async () => {

    const { body } = await request(app)
      .delete("/api/subdivisions/foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid parameter"
    })
  })

  test("DELETE:403 Responds with an error when the authenticated user attempts to delete another user's subdivision", async () => {

    const { body } = await request(app)
      .delete("/api/subdivisions/4")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission to delete subdivision data denied"
    })
  })

  test("DELETE:404 Responds with an error when the subdivision does not exist", async () => {

    const { body } = await request(app)
      .delete("/api/subdivisions/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Subdivision not found"
    })
  })
})
