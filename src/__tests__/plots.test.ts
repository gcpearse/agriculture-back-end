import data from "../db/data/test-data/test-index"
import { db } from "../db"
import { seed } from "../db/seeding/seed"
import request from "supertest"
import { app } from "../app"
import { toBeOneOf } from 'jest-extended'
import { ExtendedPlot } from "../types/plot-types"
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

afterAll(async () => {
  await seed(data)
  db.end()
})


describe("GET /api/plots/user/:owner_id", () => {

  test("GET:200 Responds with an array of plot objects sorted by plot_id in descending order", async () => {

    const { body } = await request(app)
      .get("/api/plots/user/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const sortedPlots = [...body.plots].sort((a: ExtendedPlot, b: ExtendedPlot) => {
      if (a.plot_id! < b.plot_id!) return 1
      if (a.plot_id! > b.plot_id!) return -1
      return 0
    })

    expect(body.plots).toEqual(sortedPlots)

    for (const plot of body.plots) {
      expect(plot).toMatchObject({
        plot_id: expect.any(Number),
        owner_id: 1,
        name: expect.any(String),
        type: expect.any(String),
        description: expect.any(String),
        location: expect.any(String),
        area: expect.toBeOneOf([expect.any(Number), null]),
        image_count: expect.any(Number),
        subdivision_count: expect.any(Number),
        crop_count: expect.any(Number),
        issue_count: expect.any(Number),
        job_count: expect.any(Number)
      })
    }

    expect(body.count).toBe(3)
  })

  test("GET:200 Responds with an empty array when no plots are associated with the authenticated user", async () => {

    const auth = await request(app)
      .post("/api/login")
      .send({
        username: "quince_queen",
        password: "quince123",
      })

    token = auth.body.token

    const { body } = await request(app)
      .get("/api/plots/user/3")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(Array.isArray(body.plots)).toBe(true)

    expect(body.plots).toHaveLength(0)

    expect(body.count).toBe(0)
  })

  test("GET:400 Responds with an error message when the owner_id is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/plots/user/example")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject({
      message: "Bad Request",
      details: "Invalid parameter"
    })
  })

  test("GET:403 Responds with a warning when the authenticated user attempts to retrieve another user's plot data", async () => {

    const { body } = await request(app)
      .get("/api/plots/user/2")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject({
      message: "Forbidden",
      details: "Permission to view plot data denied"
    })
  })

  test("GET:404 Responds with an error message when the owner_id does not exist", async () => {

    const { body } = await request(app)
      .get("/api/plots/user/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "User not found"
    })
  })

  test("GET:404 When the parent user is deleted, all child plots are also deleted", async () => {

    await request(app)
      .delete("/api/users/carrot_king")
      .set("Authorization", `Bearer ${token}`)
      .expect(204)

    const { body } = await request(app)
      .get("/api/plots/user/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "User not found"
    })
  })
})


describe("GET /api/plots/user/:owner_id?type=", () => {

  test("GET:200 Responds with an array of plot objects filtered by type", async () => {

    const { body } = await request(app)
      .get("/api/plots/user/1?type=allotment")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.plots).toHaveLength(2)

    for (const plot of body.plots) {
      expect(plot.type).toBe("allotment")
    }

    expect(body.count).toBe(2)
  })

  test("GET:404 Responds with an error message when the query value is invalid", async () => {

    const { body } = await request(app)
      .get("/api/plots/user/1?type=castle")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "No results found for that query"
    })
  })
})


describe("GET /api/plots/user/:owner_id?name=", () => {

  test("GET:200 Responds with an array of plot objects filtered by name", async () => {

    const { body } = await request(app)
      .get("/api/plots/user/1?name=all")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const plot of body.plots) {
      expect(plot.name).toMatch(/all/i)
    }

    expect(body.count).toBe(2)
  })

  test("GET:200 Filtered results are case-insensitive", async () => {

    const { body } = await request(app)
      .get("/api/plots/user/1?name=ALL")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const plot of body.plots) {
      expect(plot.name).toMatch(/all/i)
    }

    expect(body.count).toBe(2)
  })

  test("GET:200 Returns an empty array when the value of name matches no results", async () => {

    const { body } = await request(app)
      .get("/api/plots/user/1?name=example")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(Array.isArray(body.plots)).toBe(true)

    expect(body.plots).toHaveLength(0)

    expect(body.count).toBe(0)
  })
})


describe("GET /api/plots/user/:owner_id?type=&name=", () => {

  test("GET:200 Responds with an array of plot objects filtered by type and name", async () => {

    const { body } = await request(app)
      .get("/api/plots/user/1?type=allotment&name=new")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const plot of body.plots) {
      expect(plot.type).toBe("allotment")
      expect(plot.name).toMatch(/new/i)
    }

    expect(body.count).toBe(1)
  })
})


describe("GET /api/plots/user/:owner_id?sort=", () => {

  test("GET:200 Responds with an array of plot objects sorted by name in ascending order", async () => {

    const { body } = await request(app)
      .get("/api/plots/user/1?sort=name")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const sortedPlots = [...body.plots].sort((a: ExtendedPlot, b: ExtendedPlot) => {
      if (a.name! > b.name!) return 1
      if (a.name! < b.name!) return -1
      return 0
    })

    expect(body.plots).toEqual(sortedPlots)

    expect(body.count).toBe(3)
  })

  test("GET:404 Responds with an error when passed an invalid sort value", async () => {

    const { body } = await request(app)
      .get("/api/plots/user/1?sort=example")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "No results found for that query"
    })
  })
})


describe("GET /api/plots/user/:owner_id?order=", () => {

  test("GET:404 Responds with an error when passed an invalid order value", async () => {

    const { body } = await request(app)
      .get("/api/plots/user/1?order=example")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "No results found for that query"
    })
  })
})


describe("GET /api/plots/user/:owner_id?limit=", () => {

  test("GET:200 Responds with a limited array of plot objects associated with the owner", async () => {

    const { body } = await request(app)
      .get("/api/plots/user/1?limit=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.plots).toHaveLength(2)

    expect(body.count).toBe(3)
  })

  test("GET:200 Responds with an array of all plots associated with the owner when the limit exceeds the total number of results", async () => {

    const { body } = await request(app)
      .get("/api/plots/user/1?limit=20")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.plots).toHaveLength(3)

    expect(body.count).toBe(3)
  })

  test("GET:400 Responds with an error message when the value of limit is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/plots/user/1?limit=two")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject({
      message: "Bad Request",
      details: "Invalid parameter"
    })
  })
})


describe("GET /api/plots/user/:owner_id?page=", () => {

  test("GET:200 Responds with an array of plot objects associated with the owner beginning from the page set in the query parameter", async () => {

    const { body } = await request(app)
      .get("/api/plots/user/1?limit=2&page=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.plots.map((crop: ExtendedPlot) => {
      return crop.plot_id
    })).toEqual([1])

    expect(body.count).toBe(3)
  })

  test("GET:200 The page defaults to page one", async () => {

    const { body } = await request(app)
      .get("/api/plots/user/1?limit=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.plots.map((crop: ExtendedPlot) => {
      return crop.plot_id
    })).toEqual([4, 3])

    expect(body.count).toBe(3)
  })

  test("GET:400 Responds with an error when the value of page is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/plots/user/1?limit=2&page=three")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject({
      message: "Bad Request",
      details: "Invalid parameter"
    })
  })

  test("GET:404 Responds with an error when the page cannot be found", async () => {

    const { body } = await request(app)
      .get("/api/plots/user/1?limit=2&page=3")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "Page not found"
    })
  })

  test("GET:404 Responds with an error when the page cannot be found (multiple queries affecting total query result rows)", async () => {

    const { body } = await request(app)
      .get("/api/plots/user/1?type=garden&limit=1&page=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "Page not found"
    })
  })
})


describe("POST /api/plots/user/:owner_id", () => {

  test("POST:201 Responds with a new plot object, assigning owner_id automatically", async () => {

    const newPlot = {
      name: "John's Field",
      type: "field",
      description: "A large field",
      location: "Wildwood",
      area: 3000
    }

    const { body } = await request(app)
      .post("/api/plots/user/1")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.plot).toMatchObject({
      plot_id: 5,
      owner_id: 1,
      name: "John's Field",
      type: "field",
      description: "A large field",
      location: "Wildwood",
      area: 3000
    })
  })

  test("POST:201 Assigns a null value to 'area' when no value is provided", async () => {

    const newPlot = {
      name: "John's Field",
      type: "field",
      description: "A large field",
      location: "Wildwood"
    }

    const { body } = await request(app)
      .post("/api/plots/user/1")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.plot.area).toBeNull()
  })

  test("POST:201 Ignores any unnecessary properties on the object", async () => {

    const newPlot = {
      name: "John's Field",
      type: "field",
      description: "A large field",
      location: "Wildwood",
      area: 3000,
      price: 10000
    }

    const { body } = await request(app)
      .post("/api/plots/user/1")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.plot).not.toHaveProperty("price")
  })

  test("POST:400 Responds with an error when passed a property with an invalid data type", async () => {

    const newPlot = {
      name: "John's Field",
      type: "field",
      description: "A large field",
      location: "Wildwood",
      area: "three thousand metres"
    }

    const { body } = await request(app)
      .post("/api/plots/user/1")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject({
      message: "Bad Request",
      details: "Invalid text representation"
    })
  })

  test("POST:400 Responds with an error when a required property is missing from the request body", async () => {

    const newPlot = {
      type: "field",
      description: "A large field",
      location: "Wildwood",
      area: 3000
    }

    const { body } = await request(app)
      .post("/api/plots/user/1")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject({
      message: "Bad Request",
      details: "Not null violation"
    })
  })

  test("POST:400 Responds with an error when passed an invalid plot type", async () => {

    const newPlot = {
      name: "John's Field",
      type: "garage",
      description: "A large field",
      location: "Wildwood",
      area: 3000
    }

    const { body } = await request(app)
      .post("/api/plots/user/1")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject({
      message: "Bad Request",
      details: "Invalid plot type"
    })
  })

  test("POST:400 Responds with an error message when the owner_id is not a positive integer", async () => {

    const newPlot = {
      name: "John's Field",
      type: "field",
      description: "A large field",
      location: "Wildwood",
      area: 3000
    }

    const { body } = await request(app)
      .post("/api/plots/user/example")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject({
      message: "Bad Request",
      details: "Invalid parameter"
    })
  })

  test("POST:403 Responds with a warning when the authenticated user attempts to create a plot for another user", async () => {

    const newPlot = {
      name: "John's Field",
      type: "field",
      description: "A large field",
      location: "Wildwood",
      area: 3000
    }

    const { body } = await request(app)
      .post("/api/plots/user/2")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject({
      message: "Forbidden",
      details: "Permission to create plot denied"
    })
  })

  test("POST:404 Responds with an error message when the owner_id does not exist", async () => {

    const newPlot = {
      name: "John's Field",
      type: "field",
      description: "A large field",
      location: "Wildwood",
      area: 3000
    }

    const { body } = await request(app)
      .post("/api/plots/user/999")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "User not found"
    })
  })

  test("POST:409 Responds with an error message when the plot name already exists for one of the given user's plots", async () => {

    const newPlot = {
      name: "John's Garden",
      type: "garden",
      description: "The garden at the new house",
      location: "Applebury",
      area: 120
    }

    const { body } = await request(app)
      .post("/api/plots/user/1")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(409)

    expect(body).toMatchObject({
      message: "Conflict",
      details: "Plot name already exists"
    })
  })
})


describe("GET /api/plots/:plot_id", () => {

  test("GET:200 Responds with a plot object", async () => {

    const { body } = await request(app)
      .get("/api/plots/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.plot).toMatchObject({
      plot_id: 1,
      owner_id: 1,
      name: "John's Garden",
      type: "garden",
      description: "A vegetable garden",
      location: "Farmville",
      area: 100,
      image_count: 1,
      subdivision_count: 3,
      crop_count: 4,
      issue_count: 3,
      job_count: 2
    })
  })

  test("GET:400 Responds with an error message when the plot_id is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/plots/example")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject({
      message: "Bad Request",
      details: "Invalid parameter"
    })
  })

  test("GET:403 Responds with a warning when the plot does not belong to the authenticated user", async () => {

    const { body } = await request(app)
      .get("/api/plots/2")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject({
      message: "Forbidden",
      details: "Permission to view plot data denied"
    })
  })

  test("GET:404 Responds with an error message when the plot does not exist", async () => {

    const { body } = await request(app)
      .get("/api/plots/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "Plot not found"
    })
  })
})


describe("PATCH /api/plots/:plot_id", () => {

  test("PATCH:200 Responds with an updated plot object", async () => {

    const newDetails = {
      name: "John's Homestead",
      type: "homestead",
      description: "A homestead",
      location: "Farmville",
      area: 1200
    }

    const { body } = await request(app)
      .patch("/api/plots/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.plot).toMatchObject({
      plot_id: 1,
      owner_id: 1,
      name: "John's Homestead",
      type: "homestead",
      description: "A homestead",
      location: "Farmville",
      area: 1200
    })
  })

  test("PATCH:200 Allows the request when the plot name remains unchanged (plot name conflict should only be raised in cases of duplication)", async () => {

    const newDetails = {
      name: "John's Garden",
      type: "garden",
      description: "A new description",
      location: "234, Apricot Avenue, Farmville",
      area: 180
    }

    const { body } = await request(app)
      .patch("/api/plots/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.plot).toMatchObject({
      plot_id: 1,
      owner_id: 1,
      name: "John's Garden",
      type: "garden",
      description: "A new description",
      location: "234, Apricot Avenue, Farmville",
      area: 180
    })
  })

  test("PATCH:400 Responds with an error when a property is missing from the request body", async () => {

    const newDetails = {
      type: "homestead",
      description: "A homestead",
      location: "Farmville",
      area: 1200
    }

    const { body } = await request(app)
      .patch("/api/plots/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject({
      message: "Bad Request",
      details: "Not null violation"
    })
  })

  test("PATCH:400 Responds with an error when passed a property with an invalid data type", async () => {

    const newDetails = {
      name: "John's Homestead",
      type: "homestead",
      description: "A homestead",
      location: "Farmville",
      area: "ten metres"
    }

    const { body } = await request(app)
      .patch("/api/plots/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject({
      message: "Bad Request",
      details: "Invalid text representation"
    })
  })

  test("PATCH:400 Responds with an error when passed an invalid plot type", async () => {

    const newDetails = {
      name: "John's Homestead",
      type: "garage",
      description: "A homestead",
      location: "Farmville",
      area: 1200
    }

    const { body } = await request(app)
      .patch("/api/plots/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject({
      message: "Bad Request",
      details: "Invalid plot type"
    })
  })

  test("PATCH:400 Responds with an error message when the plot_id is not a positive integer", async () => {

    const newDetails = {
      name: "John's Homestead",
      type: "homestead",
      description: "A homestead",
      location: "Farmville",
      area: 1200
    }

    const { body } = await request(app)
      .patch("/api/plots/example")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject({
      message: "Bad Request",
      details: "Invalid parameter"
    })
  })

  test("PATCH:403 Responds with a warning when the plot_id does not belong to the authenticated user", async () => {

    const newDetails = {
      name: "John's Homestead",
      type: "homestead",
      description: "A homestead",
      location: "Farmville",
      area: 1200
    }

    const { body } = await request(app)
      .patch("/api/plots/2")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject({
      message: "Forbidden",
      details: "Permission to edit plot data denied"
    })
  })

  test("PATCH:404 Responds with an error message when the plot_id does not exist", async () => {

    const newDetails = {
      name: "John's Homestead",
      type: "homestead",
      description: "A homestead",
      location: "Farmville",
      area: 1200
    }

    const { body } = await request(app)
      .patch("/api/plots/999")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "Plot not found"
    })
  })

  test("PATCH:409 Responds with an error message when the plot name already exists for one of the given user's other plots", async () => {

    const newDetails = {
      name: "John's Allotment",
      type: "homestead",
      description: "A homestead",
      location: "Farmville",
      area: 1200
    }

    const { body } = await request(app)
      .patch("/api/plots/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(409)

    expect(body).toMatchObject({
      message: "Conflict",
      details: "Plot name already exists"
    })
  })
})


describe("DELETE /api/plots/:plot_id", () => {

  test("DELETE:204 Deletes the plot with the given plot_id", async () => {

    await request(app)
      .delete("/api/plots/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204)

    const { body } = await request(app)
      .get("/api/plots/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "Plot not found"
    })
  })

  test("DELETE:400 Responds with an error message when the plot_id is not a positive integer", async () => {

    const { body } = await request(app)
      .delete("/api/plots/example")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject({
      message: "Bad Request",
      details: "Invalid parameter"
    })
  })

  test("DELETE:403 Responds with a warning when the authenticated user attempts to delete another user's plot", async () => {

    const { body } = await request(app)
      .delete("/api/plots/2")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject({
      message: "Forbidden",
      details: "Permission to delete plot data denied"
    })
  })

  test("DELETE:404 Responds with an error message when the plot_id does not exist", async () => {

    const { body } = await request(app)
      .delete("/api/plots/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "Plot not found"
    })
  })
})
