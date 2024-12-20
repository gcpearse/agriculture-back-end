import data from "../db/data/test-data/test-index"
import { db } from "../db"
import { seed } from "../db/seeding/seed"
import { app } from "../app"

import request from "supertest"
import { toBeOneOf, toBeArrayOfSize } from 'jest-extended'

import { ExtendedSubdivision, Subdivision, SubdivisionRequest } from "../types/subdivision-types"
import { StatusResponse } from "../types/response-types"


expect.extend({ toBeOneOf, toBeArrayOfSize })


let token: string


beforeEach(async () => {

  await seed(data)

  const auth = await request(app)
    .post("/api/login")
    .send({
      login: "carrot_king",
      password: "Carrots123",
    })

  token = auth.body.token
})

afterAll(async () => {
  await seed(data)
  db.end()
})


describe("GET /api/subdivisions/plots/:plot_id", () => {

  test("GET:200 Responds with an array of subdivision objects sorted by type in ascending order", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plots/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const sortedSubdivisions: ExtendedSubdivision[] = [...body.subdivisions].sort((a: ExtendedSubdivision, b: ExtendedSubdivision) => {
      if (a.type > b.type) return 1
      if (a.type < b.type) return -1
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
      .get("/api/subdivisions/plots/3")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.subdivisions).toBeArrayOfSize(0)

    expect(body.count).toBe(0)
  })

  test("GET:400 Responds with an error when the plot_id parameter is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plots/foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("GET:403 Responds with an error when the authenticated user attempts to retrieve another user's subdivision data", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plots/2")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("GET:404 Responds with an error when the plot does not exist", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plots/999")
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
      .get("/api/subdivisions/plots/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Plot not found"
    })
  })
})


describe("GET /api/subdivisions/plots/:plot_id?type=", () => {

  test("GET:200 Responds with an array of subdivision objects filtered case-insensitively by type", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plots/1?type=bed")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.subdivisions).toHaveLength(2)

    for (const subdivision of body.subdivisions) {
      expect(subdivision.type).toBe("Bed")
    }

    expect(body.count).toBe(2)
  })

  test("GET:400 Responds with an error when the query value is invalid", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plots/1?type=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid subdivision type"
    })
  })
})


describe("GET /api/subdivisions/plots/:plot_id?name=", () => {

  test("GET:200 Responds with an array of subdivision objects filtered by name", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plots/1?name=bed")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const subdivision of body.subdivisions) {
      expect(subdivision.name).toMatch(/bed/i)
    }

    expect(body.count).toBe(2)
  })

  test("GET:200 Filtered results are case-insensitive", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plots/1?name=BED")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const subdivision of body.subdivisions) {
      expect(subdivision.name).toMatch(/bed/i)
    }

    expect(body.count).toBe(2)
  })

  test("GET:200 Returns an empty array when the value of name matches no results", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plots/1?name=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.subdivisions).toBeArrayOfSize(0)

    expect(body.count).toBe(0)
  })
})


describe("GET /api/subdivisions/plots/:plot_id?type=&name=", () => {

  test("GET:200 Responds with an array of subdivision objects filtered by type and name", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plots/1?type=bed&name=onion")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const subdivision of body.subdivisions) {
      expect(subdivision.type).toBe("Bed")
      expect(subdivision.name).toMatch(/onion/i)
    }

    expect(body.count).toBe(1)
  })
})


describe("GET /api/subdivisions/plots/:plot_id?sort=", () => {

  test("GET:200 Responds with an array of subdivision objects sorted by name in ascending order", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plots/1?sort=name")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const sortedSubdivisions: ExtendedSubdivision[] = [...body.subdivisions].sort((a: ExtendedSubdivision, b: ExtendedSubdivision) => {
      if (a.name! > b.name!) return 1
      if (a.name! < b.name!) return -1
      return 0
    })

    expect(body.subdivisions).toEqual(sortedSubdivisions)

    expect(body.count).toBe(3)
  })

  test("GET:400 Responds with an error when passed an invalid sort value", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plots/1?sort=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid query value"
    })
  })
})


describe("GET /api/subdivisions/plots/:plot_id?order=", () => {

  test("GET:400 Responds with an error when passed an invalid order value", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plots/1?order=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid query value"
    })
  })
})


describe("GET /api/subdivisions/plots/:plot_id?limit=", () => {

  test("GET:200 Responds with a limited array of subdivision objects associated with the plot", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plots/1?limit=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.subdivisions).toHaveLength(2)

    expect(body.count).toBe(3)
  })

  test("GET:200 Responds with an array of all subdivisions associated with the plot when the limit exceeds the total number of results", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plots/1?limit=20")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.subdivisions).toHaveLength(3)

    expect(body.count).toBe(3)
  })

  test("GET:400 Responds with an error when the value of limit is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plots/1?limit=two")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })
})


describe("GET /api/subdivisions/plots/:plot_id?page=", () => {

  test("GET:200 Responds with an array of subdivision objects associated with the plot beginning from the page set in the query parameter", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plots/1?limit=2&page=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.subdivisions.map((subdivision: ExtendedSubdivision) => {
      return subdivision.name
    })).toEqual(["Woody Herbs"])

    expect(body.count).toBe(3)
  })

  test("GET:200 The page defaults to page one", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plots/1?limit=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.subdivisions.map((subdivision: ExtendedSubdivision) => {
      return subdivision.name
    })).toEqual(["Onion Bed", "Root Vegetable Bed"])

    expect(body.count).toBe(3)
  })

  test("GET:400 Responds with an error when the value of page is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plots/1?limit=2&page=two")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("GET:404 Responds with an error when the page cannot be found", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plots/1?limit=2&page=3")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Page not found"
    })
  })

  test("GET:404 Responds with an error when the page cannot be found (multiple queries affecting total query result rows)", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/plots/1?type=bed&name=onion&limit=1&page=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Page not found"
    })
  })
})


describe("POST /api/subdivisions/plots/:plot_id", () => {

  test("POST:201 Responds with a new subdivision object, assigning plot_id automatically", async () => {

    const newSubdivision: SubdivisionRequest = {
      name: "Wildflowers",
      type: "Flowerbed",
      description: "Foxgloves and bluebells",
      area: 2
    }

    const { body } = await request(app)
      .post("/api/subdivisions/plots/1")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.subdivision).toMatchObject<Subdivision>({
      subdivision_id: 6,
      plot_id: 1,
      name: "Wildflowers",
      type: "Flowerbed",
      description: "Foxgloves and bluebells",
      area: 2
    })
  })

  test("POST:201 Assigns a null value to area when no value is provided", async () => {

    const newSubdivision: SubdivisionRequest = {
      name: "Wildflowers",
      type: "Flowerbed",
      description: "Foxgloves and bluebells"
    }

    const { body } = await request(app)
      .post("/api/subdivisions/plots/1")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.subdivision.area).toBeNull()
  })

  test("POST:400 Responds with an error when passed an invalid subdivision type", async () => {

    const newSubdivision: SubdivisionRequest = {
      name: "Wildflowers",
      type: "foobar",
      description: "Foxgloves and bluebells",
      area: 2
    }

    const { body } = await request(app)
      .post("/api/subdivisions/plots/1")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid subdivision type"
    })
  })

  test("POST:400 Responds with an error when the plot_id parameter is not a positive integer", async () => {

    const newSubdivision: SubdivisionRequest = {
      name: "Wildflowers",
      type: "Flowerbed",
      description: "Foxgloves and bluebells",
      area: 2
    }

    const { body } = await request(app)
      .post("/api/subdivisions/plots/foobar")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("POST:403 Responds with an error when the authenticated user attempts to create a subdivision for another user", async () => {

    const newSubdivision: SubdivisionRequest = {
      name: "Wildflowers",
      type: "Flowerbed",
      description: "Foxgloves and bluebells",
      area: 2
    }

    const { body } = await request(app)
      .post("/api/subdivisions/plots/2")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("POST:404 Responds with an error when the plot does not exist", async () => {

    const newSubdivision: SubdivisionRequest = {
      name: "Wildflowers",
      type: "Flowerbed",
      description: "Foxgloves and bluebells",
      area: 2
    }

    const { body } = await request(app)
      .post("/api/subdivisions/plots/999")
      .send(newSubdivision)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Plot not found"
    })
  })

  test("POST:409 Responds with an error when the subdivision name already exists for a subdivision of the given plot", async () => {

    const newSubdivision: SubdivisionRequest = {
      name: "Onion Bed",
      type: "Flowerbed",
      description: "Foxgloves and bluebells",
      area: 2
    }

    const { body } = await request(app)
      .post("/api/subdivisions/plots/1")
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
      issue_count: 2,
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
      details: "Value must be a positive integer"
    })
  })

  test("GET:403 Responds with an error when the subdivision does not belong to the authenticated user", async () => {

    const { body } = await request(app)
      .get("/api/subdivisions/4")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
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

    const newDetails: SubdivisionRequest = {
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

    const newDetails: SubdivisionRequest = {
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

  test("PATCH:400 Responds with an error when passed an invalid subdivision type", async () => {

    const newDetails: SubdivisionRequest = {
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

    const newDetails: SubdivisionRequest = {
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
      details: "Value must be a positive integer"
    })
  })

  test("PATCH:403 Responds with an error when the subdivision does not belong to the authenticated user", async () => {

    const newDetails: SubdivisionRequest = {
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
      details: "Permission denied"
    })
  })

  test("PATCH:404 Responds with an error when the subdivision does not exist", async () => {

    const newDetails: SubdivisionRequest = {
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

    const newDetails: SubdivisionRequest = {
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
      details: "Value must be a positive integer"
    })
  })

  test("DELETE:403 Responds with an error when the authenticated user attempts to delete another user's subdivision", async () => {

    const { body } = await request(app)
      .delete("/api/subdivisions/4")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
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
