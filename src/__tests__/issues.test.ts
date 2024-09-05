import data from "../db/data/test-data/test-index"
import { db } from "../db"
import { seed } from "../db/seeding/seed"
import request from "supertest"
import { app } from "../app"
import { ExtendedIssue } from "../types/issue-types"
import { toBeOneOf } from 'jest-extended'
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


describe("GET /api/issues/plots/:plot_id", () => {

  test("GET:200 Responds with an array of issues objects sorted by issue_id in descending order", async () => {

    const { body } = await request(app)
      .get("/api/issues/plots/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const sortedIssues = [...body.issues].sort((a: ExtendedIssue, b: ExtendedIssue) => {
      if (a.issue_id! < b.issue_id!) return 1
      if (a.issue_id! > b.issue_id!) return -1
      return 0
    })

    expect(body.issues).toEqual(sortedIssues)

    for (const issue of body.issues) {
      expect(issue).toMatchObject<ExtendedIssue>({
        issue_id: expect.any(Number),
        plot_id: 1,
        subdivision_id: expect.toBeOneOf([expect.any(Number), null]),
        title: expect.any(String),
        description: expect.any(String),
        is_critical: expect.any(Boolean),
        is_resolved: expect.any(Boolean),
        subdivision_name: expect.toBeOneOf([expect.any(String), null]),
        note_count: expect.any(Number),
        image_count: expect.any(Number)
      })
    }
  })

  test("GET:200 Responds with an empty array when no crops are associated with the plot", async () => {

    const { body } = await request(app)
      .get("/api/issues/plots/3")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(Array.isArray(body.issues)).toBe(true)

    expect(body.issues).toHaveLength(0)
  })

  test("GET:400 Responds with an error when the plot_id parameter is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/issues/plots/foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("GET:403 Responds with an error when the authenticated user attempts to retrieve another user's issue data", async () => {

    const { body } = await request(app)
      .get("/api/issues/plots/2")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("GET:404 Responds with an error when the plot does not exist", async () => {

    const { body } = await request(app)
      .get("/api/issues/plots/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Plot not found"
    })
  })

  test("GET:404 When the parent plot is deleted, all child issues are also deleted", async () => {

    await request(app)
      .delete("/api/plots/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204)

    const { body } = await request(app)
      .get("/api/issues/plots/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Plot not found"
    })
  })
})


describe("GET /api/issues/plots/:plot_id?is_critical=", () => {

  test("GET:200 Responds with an array of issues objects filtered by the value of is_critical", async () => {

    const { body } = await request(app)
      .get("/api/issues/plots/1?is_critical=true")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const issue of body.issues) {
      expect(issue.is_critical).toBe(true)
    }
  })

  test("GET:200 Returns an empty array when the value of is_critical matches no results", async () => {

    const auth = await request(app)
      .post("/api/login")
      .send({
        login: "peach_princess",
        password: "peaches123",
      })

    token = auth.body.token

    const { body } = await request(app)
      .get("/api/issues/plots/2?is_critical=true")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(Array.isArray(body.issues)).toBe(true)

    expect(body.issues).toHaveLength(0)
  })

  test("GET:400 Responds with an error when passed an invalid value for is_critical", async () => {

    const { body } = await request(app)
      .get("/api/issues/plots/1?is_critical=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid query value"
    })
  })
})


describe("GET /api/issues/plots/:plot_id?is_resolved=", () => {

  test("GET:200 Responds with an array of issues objects filtered by the value of is_resolved", async () => {

    const { body } = await request(app)
      .get("/api/issues/plots/1?is_resolved=true")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const issue of body.issues) {
      expect(issue.is_resolved).toBe(true)
    }
  })

  test("GET:200 Returns an empty array when the value of is_resolved matches no results", async () => {

    const auth = await request(app)
      .post("/api/login")
      .send({
        login: "peach_princess",
        password: "peaches123",
      })

    token = auth.body.token

    const { body } = await request(app)
      .get("/api/issues/plots/2?is_resolved=true")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(Array.isArray(body.issues)).toBe(true)

    expect(body.issues).toHaveLength(0)
  })

  test("GET:400 Responds with an error when passed an invalid value for is_resolved", async () => {

    const { body } = await request(app)
      .get("/api/issues/plots/1?is_resolved=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid query value"
    })
  })
})
