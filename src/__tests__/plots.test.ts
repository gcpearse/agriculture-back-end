import data from "../db/data/test-data/test-index"
import { db } from "../db"
import { seed } from "../db/seeding/seed"
import request from "supertest"
import { app } from "../app"
import { toBeOneOf } from 'jest-extended'
import { ExtendedPlot, Plot, PlotRequest } from "../types/plot-types"
import { StatusResponse } from "../types/response-types"
expect.extend({ toBeOneOf })


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


describe("GET /api/plots/users/:owner_id", () => {

  test("GET:200 Responds with an array of plot objects sorted by name in ascending order", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const sortedPlots: ExtendedPlot[] = [...body.plots].sort((a: ExtendedPlot, b: ExtendedPlot) => {
      if (a.name > b.name) return 1
      if (a.name < b.name) return -1
      return 0
    })

    expect(body.plots).toEqual(sortedPlots)

    for (const plot of body.plots) {
      expect(plot).toMatchObject<ExtendedPlot>({
        plot_id: expect.any(Number),
        owner_id: 1,
        name: expect.any(String),
        type: expect.any(String),
        description: expect.any(String),
        location: expect.any(String),
        area: expect.toBeOneOf([expect.any(Number), null]),
        is_pinned: expect.any(Boolean),
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
        login: "quince_queen",
        password: "Quince123",
      })

    token = auth.body.token

    const { body } = await request(app)
      .get("/api/plots/users/3")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(Array.isArray(body.plots)).toBe(true)

    expect(body.plots).toHaveLength(0)

    expect(body.count).toBe(0)
  })

  test("GET:400 Responds with an error when the owner_id parameter is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("GET:403 Responds with an error when the authenticated user attempts to retrieve another user's plot data", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/2")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("GET:404 Responds with an error when the user does not exist", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "User not found"
    })
  })

  test("GET:404 When the parent user is deleted, all child plots are also deleted", async () => {

    await request(app)
      .delete("/api/users/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204)

    const { body } = await request(app)
      .get("/api/plots/users/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "User not found"
    })
  })
})


describe("GET /api/plots/users/:owner_id?type=", () => {

  test("GET:200 Responds with an array of plot objects filtered case-insensitively by type", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/1?type=allotment")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.plots).toHaveLength(2)

    for (const plot of body.plots) {
      expect(plot.type).toBe("Allotment")
    }

    expect(body.count).toBe(2)
  })

  test("GET:400 Responds with an error when the query value is invalid", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/1?type=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid plot type"
    })
  })
})


describe("GET /api/plots/users/:owner_id?name=", () => {

  test("GET:200 Responds with an array of plot objects filtered by name", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/1?name=all")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const plot of body.plots) {
      expect(plot.name).toMatch(/all/i)
    }

    expect(body.count).toBe(2)
  })

  test("GET:200 Filtered results are case-insensitive", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/1?name=ALL")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const plot of body.plots) {
      expect(plot.name).toMatch(/all/i)
    }

    expect(body.count).toBe(2)
  })

  test("GET:200 Returns an empty array when the value of name matches no results", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/1?name=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(Array.isArray(body.plots)).toBe(true)

    expect(body.plots).toHaveLength(0)

    expect(body.count).toBe(0)
  })
})


describe("GET /api/plots/users/:owner_id?type=&name=", () => {

  test("GET:200 Responds with an array of plot objects filtered by type and name", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/1?type=allotment&name=new")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const plot of body.plots) {
      expect(plot.type).toBe("Allotment")
      expect(plot.name).toMatch(/new/i)
    }

    expect(body.count).toBe(1)
  })
})


describe("GET /api/plots/users/:owner_id?sort=", () => {

  test("GET:200 Responds with an array of plot objects sorted by plot_id in descending order", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/1?sort=plot_id")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const sortedPlots: ExtendedPlot[] = [...body.plots].sort((a: ExtendedPlot, b: ExtendedPlot) => {
      if (a.plot_id! < b.plot_id!) return 1
      if (a.plot_id! > b.plot_id!) return -1
      return 0
    })

    expect(body.plots).toEqual(sortedPlots)

    expect(body.count).toBe(3)
  })

  test("GET:400 Responds with an error when passed an invalid sort value", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/1?sort=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid query value"
    })
  })
})


describe("GET /api/plots/users/:owner_id?order=", () => {

  test("GET:400 Responds with an error when passed an invalid order value", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/1?order=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid query value"
    })
  })
})


describe("GET /api/plots/users/:owner_id?limit=", () => {

  test("GET:200 Responds with a limited array of plot objects associated with the owner", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/1?limit=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.plots).toHaveLength(2)

    expect(body.count).toBe(3)
  })

  test("GET:200 Responds with an array of all plots associated with the owner when the limit exceeds the total number of results", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/1?limit=20")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.plots).toHaveLength(3)

    expect(body.count).toBe(3)
  })

  test("GET:400 Responds with an error when the value of limit is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/1?limit=two")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })
})


describe("GET /api/plots/users/:owner_id?page=", () => {

  test("GET:200 Responds with an array of plot objects associated with the owner beginning from the page set in the query parameter", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/1?limit=2&page=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.plots.map((crop: ExtendedPlot) => {
      return crop.name
    })).toEqual(["John's New Allotment"])

    expect(body.count).toBe(3)
  })

  test("GET:200 The page defaults to page one", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/1?limit=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.plots.map((crop: ExtendedPlot) => {
      return crop.name
    })).toEqual(["John's Allotment", "John's Garden"])

    expect(body.count).toBe(3)
  })

  test("GET:400 Responds with an error when the value of page is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/1?limit=2&page=three")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("GET:404 Responds with an error when the page cannot be found", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/1?limit=2&page=3")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Page not found"
    })
  })

  test("GET:404 Responds with an error when the page cannot be found (multiple queries affecting total query result rows)", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/1?type=garden&limit=1&page=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Page not found"
    })
  })
})


describe("POST /api/plots/users/:owner_id", () => {

  test("POST:201 Responds with a new plot object, assigning owner_id and is_pinned automatically", async () => {

    const newPlot: PlotRequest = {
      name: "John's Field",
      type: "Field",
      description: "A large field",
      location: "Wildwood",
      area: 3000
    }

    const { body } = await request(app)
      .post("/api/plots/users/1")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.plot).toMatchObject<Plot>({
      plot_id: 5,
      owner_id: 1,
      name: "John's Field",
      type: "Field",
      description: "A large field",
      location: "Wildwood",
      area: 3000,
      is_pinned: false
    })
  })

  test("POST:201 Assigns a null value to area when no value is provided", async () => {

    const newPlot: PlotRequest = {
      name: "John's Field",
      type: "Field",
      description: "A large field",
      location: "Wildwood"
    }

    const { body } = await request(app)
      .post("/api/plots/users/1")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.plot.area).toBeNull()
  })

  test("POST:400 Responds with an error when passed an invalid plot type", async () => {

    const newPlot: PlotRequest = {
      name: "John's Field",
      type: "foobar",
      description: "A large field",
      location: "Wildwood",
      area: 3000
    }

    const { body } = await request(app)
      .post("/api/plots/users/1")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid plot type"
    })
  })

  test("POST:400 Responds with an error message when the owner_id parameter is not a positive integer", async () => {

    const newPlot: PlotRequest = {
      name: "John's Field",
      type: "Field",
      description: "A large field",
      location: "Wildwood",
      area: 3000
    }

    const { body } = await request(app)
      .post("/api/plots/users/foobar")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("POST:403 Responds with an error when the authenticated user attempts to create a plot for another user", async () => {

    const newPlot: PlotRequest = {
      name: "John's Field",
      type: "Field",
      description: "A large field",
      location: "Wildwood",
      area: 3000
    }

    const { body } = await request(app)
      .post("/api/plots/users/2")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("POST:404 Responds with an error when the user does not exist", async () => {

    const newPlot: PlotRequest = {
      name: "John's Field",
      type: "Field",
      description: "A large field",
      location: "Wildwood",
      area: 3000
    }

    const { body } = await request(app)
      .post("/api/plots/users/999")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "User not found"
    })
  })

  test("POST:409 Responds with an error when the plot name already exists for one of the given user's plots", async () => {

    const newPlot: PlotRequest = {
      name: "John's Garden",
      type: "Garden",
      description: "The garden at the new house",
      location: "Applebury",
      area: 120
    }

    const { body } = await request(app)
      .post("/api/plots/users/1")
      .send(newPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(409)

    expect(body).toMatchObject<StatusResponse>({
      message: "Conflict",
      details: "Plot name already exists"
    })
  })
})


describe("GET /api/plots/users/:owner_id/pinned", () => {

  test("GET:200 Responds with an array of pinned plot objects sorted by name in ascending order", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/1/pinned")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const sortedPlots: ExtendedPlot[] = [...body.plots].sort((a: Plot, b: Plot) => {
      if (a.name! > b.name!) return 1
      if (a.name! < b.name!) return -1
      return 0
    })

    expect(body.plots).toEqual(sortedPlots)

    for (const plot of body.plots) {
      expect(plot).toMatchObject<Plot>({
        plot_id: expect.any(Number),
        owner_id: 1,
        name: expect.any(String),
        type: expect.any(String),
        description: expect.any(String),
        location: expect.any(String),
        area: expect.toBeOneOf([expect.any(Number), null]),
        is_pinned: true
      })
    }
  })

  test("GET:200 Responds with an empty array when no pinned plots are associated with the authenticated user", async () => {

    const auth = await request(app)
      .post("/api/login")
      .send({
        login: "peach_princess",
        password: "Peaches123",
      })

    token = auth.body.token

    const { body } = await request(app)
      .get("/api/plots/users/2/pinned")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(Array.isArray(body.plots)).toBe(true)

    expect(body.plots).toHaveLength(0)
  })

  test("GET:400 Responds with an error when the owner_id parameter is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/foobar/pinned")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("GET:403 Responds with an error when the authenticated user attempts to retrieve another user's plot data", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/2/pinned")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("GET:404 Responds with an error when the user does not exist", async () => {

    const { body } = await request(app)
      .get("/api/plots/users/999/pinned")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "User not found"
    })
  })
})


describe("GET /api/plots/:plot_id", () => {

  test("GET:200 Responds with a plot object", async () => {

    const { body } = await request(app)
      .get("/api/plots/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.plot).toMatchObject<ExtendedPlot>({
      plot_id: 1,
      owner_id: 1,
      name: "John's Garden",
      type: "Garden",
      description: "A vegetable garden",
      location: "Farmville",
      area: 100,
      is_pinned: true,
      image_count: 1,
      subdivision_count: 3,
      crop_count: 4,
      issue_count: 4,
      job_count: 2
    })
  })

  test("GET:400 Responds with an error when the plot_id parameter is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/plots/foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("GET:403 Responds with an error when the plot does not belong to the authenticated user", async () => {

    const { body } = await request(app)
      .get("/api/plots/2")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("GET:404 Responds with an error when the plot does not exist", async () => {

    const { body } = await request(app)
      .get("/api/plots/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Plot not found"
    })
  })
})


describe("PATCH /api/plots/:plot_id", () => {

  test("PATCH:200 Responds with an updated plot object", async () => {

    const newDetails: PlotRequest = {
      name: "John's Homestead",
      type: "Homestead",
      description: "A homestead",
      location: "Farmville",
      area: 1200
    }

    const { body } = await request(app)
      .patch("/api/plots/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.plot).toMatchObject<Plot>({
      plot_id: 1,
      owner_id: 1,
      name: "John's Homestead",
      type: "Homestead",
      description: "A homestead",
      location: "Farmville",
      area: 1200,
      is_pinned: true
    })
  })

  test("PATCH:200 Allows the request when the plot name remains unchanged (plot name conflict should only be raised in cases of duplication)", async () => {

    const newDetails: PlotRequest = {
      name: "John's Garden",
      type: "Garden",
      description: "A new description",
      location: "234, Apricot Avenue, Farmville",
      area: 180
    }

    const { body } = await request(app)
      .patch("/api/plots/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.plot).toMatchObject<Plot>({
      plot_id: 1,
      owner_id: 1,
      name: "John's Garden",
      type: "Garden",
      description: "A new description",
      location: "234, Apricot Avenue, Farmville",
      area: 180,
      is_pinned: true
    })
  })

  test("PATCH:400 Responds with an error when passed an invalid plot type", async () => {

    const newDetails: PlotRequest = {
      name: "John's Homestead",
      type: "foobar",
      description: "A homestead",
      location: "Farmville",
      area: 1200
    }

    const { body } = await request(app)
      .patch("/api/plots/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid plot type"
    })
  })

  test("PATCH:400 Responds with an error when the plot_id parameter is not a positive integer", async () => {

    const newDetails: PlotRequest = {
      name: "John's Homestead",
      type: "Homestead",
      description: "A homestead",
      location: "Farmville",
      area: 1200
    }

    const { body } = await request(app)
      .patch("/api/plots/foobar")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("PATCH:403 Responds with an error when the plot does not belong to the authenticated user", async () => {

    const newDetails: PlotRequest = {
      name: "John's Homestead",
      type: "Homestead",
      description: "A homestead",
      location: "Farmville",
      area: 1200
    }

    const { body } = await request(app)
      .patch("/api/plots/2")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("PATCH:404 Responds with an error when the plot does not exist", async () => {

    const newDetails: PlotRequest = {
      name: "John's Homestead",
      type: "Homestead",
      description: "A homestead",
      location: "Farmville",
      area: 1200
    }

    const { body } = await request(app)
      .patch("/api/plots/999")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Plot not found"
    })
  })

  test("PATCH:409 Responds with an error when the plot name already exists for one of the given user's other plots", async () => {

    const newDetails: PlotRequest = {
      name: "John's Allotment",
      type: "Homestead",
      description: "A homestead",
      location: "Farmville",
      area: 1200
    }

    const { body } = await request(app)
      .patch("/api/plots/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(409)

    expect(body).toMatchObject<StatusResponse>({
      message: "Conflict",
      details: "Plot name already exists"
    })
  })
})


describe("DELETE /api/plots/:plot_id", () => {

  test("DELETE:204 Deletes the plot with the given plot ID", async () => {

    await request(app)
      .delete("/api/plots/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204)

    const { body } = await request(app)
      .get("/api/plots/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Plot not found"
    })
  })

  test("DELETE:400 Responds with an error when the plot_id parameter is not a positive integer", async () => {

    const { body } = await request(app)
      .delete("/api/plots/foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("DELETE:403 Responds with an error when the authenticated user attempts to delete another user's plot", async () => {

    const { body } = await request(app)
      .delete("/api/plots/2")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("DELETE:404 Responds with an error when the plot does not exist", async () => {

    const { body } = await request(app)
      .delete("/api/plots/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Plot not found"
    })
  })
})


describe("PATCH /api/plots/:plot_id/pin", () => {

  test("PATCH:200 Responds with a success message when a plot is successfully pinned", async () => {

    const toggle: { isPinned: boolean } = { isPinned: true }

    const { body } = await request(app)
      .patch("/api/plots/4/pin")
      .send(toggle)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body).toMatchObject<StatusResponse>({
      message: "OK",
      details: "Plot pinned successfully"
    })
  })

  test("PATCH:400 Responds with an error when the plot is already pinned or the the maximum number of pinned plots has been reached", async () => {

    const fourthPlot: PlotRequest = {
      name: "John's Orchard",
      type: "Orchard",
      description: "An orchard",
      location: "Farmville"
    }

    const fifthPlot: PlotRequest = {
      name: "John's New Orchard",
      type: "Orchard",
      description: "A new orchard",
      location: "Farmville",
    }

    await request(app)
      .post("/api/plots/users/1")
      .send(fourthPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    await request(app)
      .post("/api/plots/users/1")
      .send(fifthPlot)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    const toggle: { isPinned: boolean } = { isPinned: true }

    await request(app)
      .patch("/api/plots/4/pin")
      .send(toggle)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    await request(app)
      .patch("/api/plots/5/pin")
      .send(toggle)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const { body } = await request(app)
      .patch("/api/plots/6/pin")
      .send(toggle)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Plot already pinned or pin limit reached"
    })
  })

  test("PATCH:400 Responds with an error when the value of isPinned is not true", async () => {

    const toggle: { isPinned: boolean } = { isPinned: false }

    const { body } = await request(app)
      .patch("/api/plots/1/pin")
      .send(toggle)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid boolean value"
    })

  })

  test("PATCH:400 Responds with an error when the plot_id parameter is not a positive integer", async () => {

    const toggle: { isPinned: boolean } = { isPinned: true }

    const { body } = await request(app)
      .patch("/api/plots/foobar/pin")
      .send(toggle)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("PATCH:403 Responds with an error when the plot does not belong to the authenticated user", async () => {

    const toggle: { isPinned: boolean } = { isPinned: true }

    const { body } = await request(app)
      .patch("/api/plots/2/pin")
      .send(toggle)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("PATCH:404 Responds with an error when the plot does not exist", async () => {

    const toggle: { isPinned: boolean } = { isPinned: true }

    const { body } = await request(app)
      .patch("/api/plots/999/pin")
      .send(toggle)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Plot not found"
    })
  })
})
