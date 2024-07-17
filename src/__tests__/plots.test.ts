import data from "../db/data/test-data/data-index"
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

  test("GET:200 Responds with an array of plot objects", async () => {

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

  test("GET:404 Responds with an error message when the owner_id does not exist", async () => {

    const { body } = await request(app)
      .get("/api/plots/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "User not found"
    })
  })

  test("GET:404 Responds with an error message when the owner_id is not a number", async () => {

    const { body } = await request(app)
      .get("/api/plots/plot")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "User not found"
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


describe("POST /api/plots/:owner_id", () => {

  test("POST:201 Responds with a new plot object", async () => {

    const newPlot = {
      owner_id: 1,
      name: "John's Field",
      type: "field",
      description: "A large field",
      location: "Wildwood",
      area: 3000
    }

    const { body } = await request(app)
      .post("/api/plots/1")
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
      owner_id: 1,
      name: "John's Field",
      type: "field",
      description: "A large field",
      location: "Wildwood"
    }

    const { body } = await request(app)
      .post("/api/plots/1")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.plot.area).toBeNull()
  })

  test("POST:201 Ignores any unnecessary properties on the object", async () => {

    const newPlot = {
      owner_id: 1,
      name: "John's Field",
      type: "field",
      description: "A large field",
      location: "Wildwood",
      area: 3000,
      price: 10000
    }

    const { body } = await request(app)
      .post("/api/plots/1")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.plot).not.toHaveProperty("price")
  })

  test("POST:400 Responds with an error when passed a property with an invalid data type", async () => {

    const newPlot = {
      owner_id: 1,
      name: "John's Field",
      type: "field",
      description: "A large field",
      location: "Wildwood",
      area: "three thousand metres"
    }

    const { body } = await request(app)
      .post("/api/plots/1")
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
      owner_id: 1,
      type: "field",
      description: "A large field",
      location: "Wildwood",
      area: 3000
    }

    const { body } = await request(app)
      .post("/api/plots/1")
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
      owner_id: 1,
      name: "John's Field",
      type: "garage",
      description: "A large field",
      location: "Wildwood",
      area: 3000
    }

    const { body } = await request(app)
      .post("/api/plots/1")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject({
      message: "Bad Request",
      details: "Invalid plot type"
    })
  })

  test("POST:403 Responds with a warning when the authenticated user attempts to create a plot for another user", async () => {

    const newPlot = {
      owner_id: 1,
      name: "John's Field",
      type: "field",
      description: "A large field",
      location: "Wildwood",
      area: 3000
    }

    const { body } = await request(app)
      .post("/api/plots/2")
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
      owner_id: 1,
      name: "John's Field",
      type: "field",
      description: "A large field",
      location: "Wildwood",
      area: 3000
    }

    const { body } = await request(app)
      .post("/api/plots/999")
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
      owner_id: 1,
      name: "John's Garden",
      type: "garden",
      description: "The garden at the new house",
      location: "Applebury",
      area: 120
    }

    const { body } = await request(app)
      .post("/api/plots/1")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(409)

    expect(body).toMatchObject({
      message: "Conflict",
      details: "Plot name already exists"
    })
  })
})


describe("GET /api/plots/plot/:plot_id", () => {

  test("GET:200 Responds with a plot object", async () => {

    const { body } = await request(app)
      .get("/api/plots/plot/1")
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

  test("GET:403 Responds with a warning when the plot_id does not belong to the authenticated user", async () => {

    const { body } = await request(app)
      .get("/api/plots/plot/2")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject({
      message: "Forbidden",
      details: "Permission to view plot data denied"
    })
  })

  test("GET:404 Responds with an error message when the plot_id does not exist", async () => {

    const { body } = await request(app)
      .get("/api/plots/plot/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "Plot not found"
    })
  })
})


describe("PATCH /api/plots/plot/:plot_id", () => {

  test("PATCH:200 Responds with an updated plot object", async () => {

    const newDetails = {
      name: "John's Vegetable Patch",
      type: "vegetable patch",
      description: "A vegetable patch",
      location: "123, Salsify Street, Farmville",
      area: 10
    }

    const { body } = await request(app)
      .patch("/api/plots/plot/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.plot).toMatchObject({
      plot_id: 1,
      owner_id: 1,
      name: "John's Vegetable Patch",
      type: "vegetable patch",
      description: "A vegetable patch",
      location: "123, Salsify Street, Farmville",
      area: 10
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
      .patch("/api/plots/plot/1")
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

  test("PATCH:400 Responds with an error when passed a property with an invalid data type", async () => {

    const newDetails = {
      name: "John's Vegetable Patch",
      type: "vegetable patch",
      description: "A vegetable patch",
      location: "123, Salsify Street, Farmville",
      area: "ten metres"
    }

    const { body } = await request(app)
      .patch("/api/plots/plot/1")
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
      name: "John's Vegetable Patch",
      type: "garage",
      description: "A vegetable patch",
      location: "123, Salsify Street, Farmville",
      area: 10
    }

    const { body } = await request(app)
      .patch("/api/plots/plot/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject({
      message: "Bad Request",
      details: "Invalid plot type"
    })
  })

  test("PATCH:403 Responds with a warning when the plot_id does not belong to the authenticated user", async () => {

    const newDetails = {
      name: "John's Vegetable Patch",
      type: "vegetable patch",
      description: "A vegetable patch",
      location: "123, Salsify Street, Farmville",
      area: 10
    }

    const { body } = await request(app)
      .patch("/api/plots/plot/2")
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
      name: "John's Vegetable Patch",
      type: "vegetable patch",
      description: "A vegetable patch",
      location: "123, Salsify Street, Farmville",
      area: 10
    }

    const { body } = await request(app)
      .patch("/api/plots/plot/999")
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
      type: "garden",
      description: "A vegetable garden",
      location: "Farmville",
      area: 100
    }

    const { body } = await request(app)
      .patch("/api/plots/plot/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(409)

    expect(body).toMatchObject({
      message: "Conflict",
      details: "Plot name already exists"
    })
  })
})


describe("DELETE /api/plots/plot/:plot_id", () => {

  test("DELETE:204 Deletes the plot with the given plot_id", async () => {

    await request(app)
      .delete("/api/plots/plot/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204)

    const { body } = await request(app)
      .get("/api/plots/plot/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "Plot not found"
    })
  })

  test("DELETE:403 Responds with a warning when the authenticated user attempts to delete another user's plot", async () => {

    const { body } = await request(app)
      .delete("/api/plots/plot/2")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject({
      message: "Forbidden",
      details: "Permission to delete plot data denied"
    })
  })

  test("DELETE:404 Responds with an error message when the plot_id does not exist", async () => {

    const { body } = await request(app)
      .delete("/api/plots/plot/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "Plot not found"
    })
  })

  test("DELETE:404 Responds with an error message when the plot_id is not a number", async () => {

    const { body } = await request(app)
      .delete("/api/plots/plot/example")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject({
      message: "Not Found",
      details: "Plot not found"
    })
  })
})
