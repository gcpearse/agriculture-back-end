import data from "../db/data/test-data/test-index"
import { db } from "../db"
import { seed } from "../db/seeding/seed"
import { app } from "../app"

import request from "supertest"
import { toBeOneOf, toBeArrayOfSize } from 'jest-extended'

import { ExtendedIssue, Issue, IssueRequest } from "../types/issue-types"
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


describe("GET /api/issues/plots/:plot_id", () => {

  test("GET:200 Responds with an array of issue objects sorted by issue_id in descending order", async () => {

    const { body } = await request(app)
      .get("/api/issues/plots/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const sortedIssues: ExtendedIssue[] = [...body.issues].sort((a: ExtendedIssue, b: ExtendedIssue) => {
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

    expect(body.count).toBe(4)
  })

  test("GET:200 Responds with an empty array when no issues are associated with the plot", async () => {

    const { body } = await request(app)
      .get("/api/issues/plots/3")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.issues).toBeArrayOfSize(0)

    expect(body.count).toBe(0)
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

  test("GET:200 Responds with an array of issue objects filtered by the value of is_critical", async () => {

    const { body } = await request(app)
      .get("/api/issues/plots/1?is_critical=true")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const issue of body.issues) {
      expect(issue.is_critical).toBe(true)
    }

    expect(body.count).toBe(2)
  })

  test("GET:200 Returns an empty array when the value of is_critical matches no results", async () => {

    const auth = await request(app)
      .post("/api/login")
      .send({
        login: "peach_princess",
        password: "Peaches123",
      })

    token = auth.body.token

    const { body } = await request(app)
      .get("/api/issues/plots/2?is_critical=true")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.issues).toBeArrayOfSize(0)

    expect(body.count).toBe(0)
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

  test("GET:200 Responds with an array of issue objects filtered by the value of is_resolved", async () => {

    const { body } = await request(app)
      .get("/api/issues/plots/1?is_resolved=true")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const issue of body.issues) {
      expect(issue.is_resolved).toBe(true)
    }

    expect(body.count).toBe(1)
  })

  test("GET:200 Returns an empty array when the value of is_resolved matches no results", async () => {

    const auth = await request(app)
      .post("/api/login")
      .send({
        login: "peach_princess",
        password: "Peaches123",
      })

    token = auth.body.token

    const { body } = await request(app)
      .get("/api/issues/plots/2?is_resolved=true")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.issues).toBeArrayOfSize(0)

    expect(body.count).toBe(0)
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


describe("GET /api/issues/plots/:plot_id?sort=", () => {

  test("GET:200 Responds with an array of issue objects sorted by title in ascending order", async () => {

    const { body } = await request(app)
      .get("/api/issues/plots/1?sort=title")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const sortedIssues: ExtendedIssue[] = [...body.issues].sort((a: ExtendedIssue, b: ExtendedIssue) => {
      if (a.title! > b.title!) return 1
      if (a.title! < b.title!) return -1
      return 0
    })

    expect(body.issues).toEqual(sortedIssues)

    expect(body.count).toBe(4)
  })

  test("GET:400 Responds with an error when passed an invalid sort value", async () => {

    const { body } = await request(app)
      .get("/api/issues/plots/1?sort=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid query value"
    })
  })
})


describe("GET /api/issues/plots/:plot_id?is_critical=&sort=", () => {

  test("GET:200 Responds with an array of issue objects filtered by the value of is_critical and sorted by title in ascending order", async () => {

    const { body } = await request(app)
      .get("/api/issues/plots/1?is_critical=true&sort=title")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const issue of body.issues) {
      expect(issue.is_critical).toBe(true)
    }

    const sortedIssues: ExtendedIssue[] = [...body.issues].sort((a: ExtendedIssue, b: ExtendedIssue) => {
      if (a.title! > b.title!) return 1
      if (a.title! < b.title!) return -1
      return 0
    })

    expect(body.issues).toEqual(sortedIssues)

    expect(body.count).toBe(2)
  })
})


describe("GET /api/issues/plots/:plot_id?order=", () => {

  test("GET:400 Responds with an error when passed an invalid order value", async () => {

    const { body } = await request(app)
      .get("/api/issues/plots/1?order=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid query value"
    })
  })
})


describe("GET /api/issues/plots/:plot_id?limit=", () => {

  test("GET:200 Responds with a limited array of issue objects associated with the plot", async () => {

    const { body } = await request(app)
      .get("/api/issues/plots/1?limit=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.issues).toHaveLength(2)

    expect(body.count).toBe(4)
  })

  test("GET:200 Responds with an array of all issues associated with the plot when the limit exceeds the total number of results", async () => {

    const { body } = await request(app)
      .get("/api/issues/plots/1?limit=20")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.issues).toHaveLength(4)

    expect(body.count).toBe(4)
  })

  test("GET:400 Responds with an error when the value of limit is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/issues/plots/1?limit=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })
})


describe("GET /api/issues/plots/:plot_id?page=", () => {

  test("GET:200 Responds with an array of issue objects associated with the plot beginning from the page set in the query parameter", async () => {

    const { body } = await request(app)
      .get("/api/issues/plots/1?limit=2&page=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.issues.map((issue: ExtendedIssue) => {
      return issue.issue_id
    })).toEqual([2, 1])

    expect(body.count).toBe(4)
  })

  test("GET:200 The page defaults to page one", async () => {

    const { body } = await request(app)
      .get("/api/issues/plots/1?limit=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.issues.map((issue: ExtendedIssue) => {
      return issue.issue_id
    })).toEqual([5, 3])

    expect(body.count).toBe(4)
  })

  test("GET:400 Responds with an error when the value of page is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/issues/plots/1?limit=2&page=two")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("GET:404 Responds with an error when the page cannot be found", async () => {

    const { body } = await request(app)
      .get("/api/issues/plots/1?limit=2&page=3")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Page not found"
    })
  })
})


describe("POST /api/issues/plots/:plot_id", () => {

  test("POST:201 Responds with a new crop object, assigning plot_id, subdivision_id (null), and is_resolved (false) automatically", async () => {

    const newIssue: IssueRequest = {
      title: "Fallen tree",
      description: "A tree has been knocked over by the wind",
      is_critical: true
    }

    const { body } = await request(app)
      .post("/api/issues/plots/1")
      .send(newIssue)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.issue).toMatchObject<Issue>({
      issue_id: 6,
      plot_id: 1,
      subdivision_id: null,
      title: "Fallen tree",
      description: "A tree has been knocked over by the wind",
      is_critical: true,
      is_resolved: false
    })
  })

  test("POST:201 Assigns a false value to is_critical when no value is provided", async () => {

    const newIssue: IssueRequest = {
      title: "Fallen tree",
      description: "A tree has been knocked over by the wind"
    }

    const { body } = await request(app)
      .post("/api/issues/plots/1")
      .send(newIssue)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.issue).toMatchObject<Issue>({
      issue_id: 6,
      plot_id: 1,
      subdivision_id: null,
      title: "Fallen tree",
      description: "A tree has been knocked over by the wind",
      is_critical: false,
      is_resolved: false
    })
  })

  test("POST:400 Responds with an error when the plot_id parameter is not a positive integer", async () => {

    const newIssue: IssueRequest = {
      title: "Fallen tree",
      description: "A tree has been knocked over by the wind"
    }

    const { body } = await request(app)
      .post("/api/issues/plots/foobar")
      .send(newIssue)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("POST:403 Responds with an error when the authenticated user attempts to add an issue for another user", async () => {

    const newIssue: IssueRequest = {
      title: "Fallen tree",
      description: "A tree has been knocked over by the wind"
    }

    const { body } = await request(app)
      .post("/api/issues/plots/2")
      .send(newIssue)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("POST:404 Responds with an error when the plot does not exist", async () => {

    const newIssue: IssueRequest = {
      title: "Fallen tree",
      description: "A tree has been knocked over by the wind"
    }

    const { body } = await request(app)
      .post("/api/issues/plots/999")
      .send(newIssue)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Plot not found"
    })
  })
})


describe("GET /api/issues/subdivisions/:subdivision_id", () => {

  test("GET:200 Responds with an array of issue objects sorted by issue_id in descending order", async () => {

    const { body } = await request(app)
      .get("/api/issues/subdivisions/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const sortedIssues: ExtendedIssue[] = [...body.issues].sort((a: ExtendedIssue, b: ExtendedIssue) => {
      if (a.issue_id! < b.issue_id!) return 1
      if (a.issue_id! > b.issue_id!) return -1
      return 0
    })

    expect(body.issues).toEqual(sortedIssues)

    for (const issue of body.issues) {
      expect(issue).toMatchObject<ExtendedIssue>({
        issue_id: expect.any(Number),
        plot_id: 1,
        subdivision_id: 1,
        title: expect.any(String),
        description: expect.any(String),
        is_critical: expect.any(Boolean),
        is_resolved: expect.any(Boolean),
        note_count: expect.any(Number),
        image_count: expect.any(Number)
      })
    }

    expect(body.count).toBe(2)
  })

  test("GET:200 Responds with an empty array when no issues are associated with the subdivisions", async () => {

    const { body } = await request(app)
      .get("/api/issues/subdivisions/2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.issues).toBeArrayOfSize(0)

    expect(body.count).toBe(0)
  })

  test("GET:400 Responds with an error when the subdivision_id parameter is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/issues/subdivisions/foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("GET:403 Responds with an error when the authenticated user attempts to retrieve another user's issue data", async () => {

    const { body } = await request(app)
      .get("/api/issues/subdivisions/4")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("GET:404 Responds with an error when the plot does not exist", async () => {

    const { body } = await request(app)
      .get("/api/issues/subdivisions/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Subdivision not found"
    })
  })

  test("GET:404 When the parent subdivision is deleted, all child issues are also deleted", async () => {

    await request(app)
      .delete("/api/subdivisions/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204)

    const { body } = await request(app)
      .get("/api/issues/subdivisions/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Subdivision not found"
    })
  })
})


describe("GET /api/issues/subdivisions/:subdivision_id?is_critical=", () => {

  test("GET:200 Responds with an array of issue objects filtered by the value of is_critical", async () => {

    const { body } = await request(app)
      .get("/api/issues/subdivisions/1?is_critical=true")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const issue of body.issues) {
      expect(issue.is_critical).toBe(true)
    }

    expect(body.count).toBe(1)
  })

  test("GET:200 Returns an empty array when the value of is_critical matches no results", async () => {

    const { body } = await request(app)
      .get("/api/issues/subdivisions/2?is_critical=true")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.issues).toBeArrayOfSize(0)

    expect(body.count).toBe(0)
  })

  test("GET:400 Responds with an error when passed an invalid value for is_critical", async () => {

    const { body } = await request(app)
      .get("/api/issues/subdivisions/1?is_critical=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid query value"
    })
  })
})


describe("GET /api/issues/subdivisions/:subdivision_id?is_resolved=", () => {

  test("GET:200 Responds with an array of issue objects filtered by the value of is_resolved", async () => {

    const { body } = await request(app)
      .get("/api/issues/subdivisions/1?is_resolved=false")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    for (const issue of body.issues) {
      expect(issue.is_resolved).toBe(false)
    }

    expect(body.count).toBe(2)
  })

  test("GET:200 Returns an empty array when the value of is_resolved matches no results", async () => {

    const { body } = await request(app)
      .get("/api/issues/subdivisions/1?is_resolved=true")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.issues).toBeArrayOfSize(0)

    expect(body.count).toBe(0)
  })

  test("GET:400 Responds with an error when passed an invalid value for is_resolved", async () => {

    const { body } = await request(app)
      .get("/api/issues/subdivisions/1?is_resolved=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid query value"
    })
  })
})


describe("GET /api/issues/subdivisions/:subdivision_id?sort=", () => {

  test("GET:200 Responds with an array of issue objects sorted by title in ascending order", async () => {

    const { body } = await request(app)
      .get("/api/issues/subdivisions/1?sort=title")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const sortedIssues: ExtendedIssue[] = [...body.issues].sort((a: ExtendedIssue, b: ExtendedIssue) => {
      if (a.title! > b.title!) return 1
      if (a.title! < b.title!) return -1
      return 0
    })

    expect(body.issues).toEqual(sortedIssues)

    expect(body.count).toBe(2)
  })

  test("GET:400 Responds with an error when passed an invalid sort value", async () => {

    const { body } = await request(app)
      .get("/api/issues/subdivisions/1?sort=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid query value"
    })
  })
})


describe("GET /api/issues/subdivisions/:subdivision_id?order=", () => {

  test("GET:400 Responds with an error when passed an invalid order value", async () => {

    const { body } = await request(app)
      .get("/api/issues/subdivisions/1?order=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid query value"
    })
  })
})


describe("GET /api/issues/subdivisions/:subdivision_id?limit=", () => {

  test("GET:200 Responds with a limited array of issue objects associated with the subdivision", async () => {

    const { body } = await request(app)
      .get("/api/issues/subdivisions/1?limit=1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.issues).toHaveLength(1)

    expect(body.count).toBe(2)
  })

  test("GET:200 Responds with an array of all issues associated with the plot when the limit exceeds the total number of results", async () => {

    const { body } = await request(app)
      .get("/api/issues/subdivisions/1?limit=20")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.issues).toHaveLength(2)

    expect(body.count).toBe(2)
  })

  test("GET:400 Responds with an error when the value of limit is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/issues/subdivisions/1?limit=foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })
})


describe("GET /api/issues/subdivisions/:subdivision_id?page=", () => {

  test("GET:200 Responds with an array of issue objects associated with the subdivision beginning from the page set in the query parameter", async () => {

    const { body } = await request(app)
      .get("/api/issues/subdivisions/1?limit=1&page=2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.issues.map((issue: ExtendedIssue) => {
      return issue.issue_id
    })).toEqual([3])

    expect(body.count).toBe(2)
  })

  test("GET:200 The page defaults to page one", async () => {

    const { body } = await request(app)
      .get("/api/issues/subdivisions/1?limit=1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.issues.map((issue: ExtendedIssue) => {
      return issue.issue_id
    })).toEqual([5])

    expect(body.count).toBe(2)
  })

  test("GET:400 Responds with an error when the value of page is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/issues/subdivisions/1?limit=2&page=two")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("GET:404 Responds with an error when the page cannot be found", async () => {

    const { body } = await request(app)
      .get("/api/issues/subdivisions/1?limit=1&page=3")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Page not found"
    })
  })
})


describe("POST /api/issues/subdivisions/:subdivision_id", () => {

  test("POST:201 Responds with a new crop object, assigning plot_id, subdivision_id, and is_resolved (false) automatically", async () => {

    const newIssue: IssueRequest = {
      title: "Fallen tree",
      description: "A tree has been knocked over by the wind",
      is_critical: true
    }

    const { body } = await request(app)
      .post("/api/issues/subdivisions/1")
      .send(newIssue)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.issue).toMatchObject<Issue>({
      issue_id: 6,
      plot_id: 1,
      subdivision_id: 1,
      title: "Fallen tree",
      description: "A tree has been knocked over by the wind",
      is_critical: true,
      is_resolved: false
    })
  })

  test("POST:201 Assigns a false value to is_critical when no value is provided", async () => {

    const newIssue: IssueRequest = {
      title: "Fallen tree",
      description: "A tree has been knocked over by the wind"
    }

    const { body } = await request(app)
      .post("/api/issues/subdivisions/1")
      .send(newIssue)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.issue).toMatchObject<Issue>({
      issue_id: 6,
      plot_id: 1,
      subdivision_id: 1,
      title: "Fallen tree",
      description: "A tree has been knocked over by the wind",
      is_critical: false,
      is_resolved: false
    })
  })

  test("POST:400 Responds with an error when the subdivision_id parameter is not a positive integer", async () => {

    const newIssue: IssueRequest = {
      title: "Fallen tree",
      description: "A tree has been knocked over by the wind"
    }

    const { body } = await request(app)
      .post("/api/issues/subdivisions/foobar")
      .send(newIssue)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("POST:403 Responds with an error when the authenticated user attempts to add an issue for another user", async () => {

    const newIssue: IssueRequest = {
      title: "Fallen tree",
      description: "A tree has been knocked over by the wind"
    }

    const { body } = await request(app)
      .post("/api/issues/subdivisions/4")
      .send(newIssue)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("POST:404 Responds with an error when the subdivision does not exist", async () => {

    const newIssue: IssueRequest = {
      title: "Fallen tree",
      description: "A tree has been knocked over by the wind"
    }

    const { body } = await request(app)
      .post("/api/issues/subdivisions/999")
      .send(newIssue)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Subdivision not found"
    })
  })
})


describe("GET /api/issues/:issue_id", () => {

  test("GET:200 Responds with an issue object", async () => {

    const { body } = await request(app)
      .get("/api/issues/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.issue).toMatchObject<ExtendedIssue>({
      issue_id: 1,
      plot_id: 1,
      subdivision_id: null,
      title: "Broken gate",
      description: "The gate has fallen off its hinges",
      is_critical: true,
      is_resolved: false,
      plot_name: "John's Garden",
      subdivision_name: null,
      note_count: 2,
      image_count: 2
    })
  })

  test("GET:400 Responds with an error when the issue_id parameter is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/issues/foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("GET:403 Responds with an error when the issue does not belong to the authenticated user", async () => {

    const { body } = await request(app)
      .get("/api/issues/4")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("GET:404 Responds with an error when the issue does not exist", async () => {

    const { body } = await request(app)
      .get("/api/issues/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Issue not found"
    })
  })
})


describe("PATCH /api/issues/:issue_id", () => {

  test("PATCH:200 Responds with an updated issue object", async () => {

    const newDetails: IssueRequest = {
      title: "Damaged gate",
      description: "The hinges are rusty",
      is_critical: false
    }

    const { body } = await request(app)
      .patch("/api/issues/1")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.issue).toMatchObject<Issue>({
      issue_id: 1,
      plot_id: 1,
      subdivision_id: null,
      title: "Damaged gate",
      description: "The hinges are rusty",
      is_critical: false,
      is_resolved: false
    })
  })

  test("PATCH:400 Responds with an error when the issue_id parameter is not a positive integer", async () => {

    const newDetails: IssueRequest = {
      title: "Damaged gate",
      description: "The hinges are rusty",
      is_critical: false
    }

    const { body } = await request(app)
      .patch("/api/issues/foobar")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("PATCH:403 Responds with an error when the issue does not belong to the authenticated user", async () => {

    const newDetails: IssueRequest = {
      title: "Damaged gate",
      description: "The hinges are rusty",
      is_critical: false
    }

    const { body } = await request(app)
      .patch("/api/issues/4")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("PATCH:404 Responds with an error when the issue does not exist", async () => {

    const newDetails: IssueRequest = {
      title: "Damaged gate",
      description: "The hinges are rusty",
      is_critical: false
    }

    const { body } = await request(app)
      .patch("/api/issues/999")
      .send(newDetails)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Issue not found"
    })
  })
})


describe("PATCH /api/issues/:issue_id/resolve", () => {

  test("PATCH:200 Responds with an updated issue object setting is_critical to false automatically", async () => {

    const toggle: { isResolved: boolean } = { isResolved: true }

    const { body } = await request(app)
      .patch("/api/issues/1/resolve")
      .send(toggle)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.issue).toMatchObject<Issue>({
      issue_id: 1,
      plot_id: 1,
      subdivision_id: null,
      title: "Broken gate",
      description: "The gate has fallen off its hinges",
      is_critical: false,
      is_resolved: true
    })
  })

  test("PATCH:400 Responds with an error when the issue is already resolved", async () => {

    const toggle: { isResolved: boolean } = { isResolved: true }

    const { body } = await request(app)
      .patch("/api/issues/2/resolve")
      .send(toggle)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Issue already resolved"
    })
  })

  test("PATCH:400 Responds with an error when the value of isResolved is not true", async () => {

    const toggle: { isResolved: boolean } = { isResolved: false }

    const { body } = await request(app)
      .patch("/api/issues/1/resolve")
      .send(toggle)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid boolean value"
    })
  })

  test("PATCH:400 Responds with an error when the issue_id parameter is not a positive integer", async () => {

    const toggle: { isResolved: boolean } = { isResolved: true }

    const { body } = await request(app)
      .patch("/api/issues/foobar/resolve")
      .send(toggle)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("PATCH:403 Responds with an error when the issue does not belong to the authenticated user", async () => {

    const toggle: { isResolved: boolean } = { isResolved: true }

    const { body } = await request(app)
      .patch("/api/issues/4/resolve")
      .send(toggle)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("PATCH:404 Responds with an error when the issue does not exist", async () => {

    const toggle: { isResolved: boolean } = { isResolved: true }

    const { body } = await request(app)
      .patch("/api/issues/999/resolve")
      .send(toggle)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Issue not found"
    })
  })
})


describe("PATCH /api/issues/:issue_id/unresolve", () => {

  test("PATCH:200 Responds with an updated issue object", async () => {

    const toggle: { isResolved: boolean } = { isResolved: false }

    const { body } = await request(app)
      .patch("/api/issues/2/unresolve")
      .send(toggle)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(body.issue).toMatchObject<Issue>({
      issue_id: 2,
      plot_id: 1,
      subdivision_id: null,
      title: "Weeds",
      description: "The garden has become infested with weeds",
      is_critical: false,
      is_resolved: false
    })
  })

  test("PATCH:400 Responds with an error when the issue is already unresolved", async () => {

    const toggle: { isResolved: boolean } = { isResolved: false }

    const { body } = await request(app)
      .patch("/api/issues/1/unresolve")
      .send(toggle)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Issue already unresolved"
    })
  })

  test("PATCH:400 Responds with an error when the value of isResolved is not false", async () => {

    const toggle: { isResolved: boolean } = { isResolved: true }

    const { body } = await request(app)
      .patch("/api/issues/2/unresolve")
      .send(toggle)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Invalid boolean value"
    })
  })

  test("PATCH:400 Responds with an error when the issue_id parameter is not a positive integer", async () => {

    const toggle: { isResolved: boolean } = { isResolved: false }

    const { body } = await request(app)
      .patch("/api/issues/foobar/unresolve")
      .send(toggle)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("PATCH:403 Responds with an error when the issue does not belong to the authenticated user", async () => {

    const toggle: { isResolved: boolean } = { isResolved: false }

    const { body } = await request(app)
      .patch("/api/issues/4/unresolve")
      .send(toggle)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("PATCH:404 Responds with an error when the issue does not exist", async () => {

    const toggle: { isResolved: boolean } = { isResolved: false }

    const { body } = await request(app)
      .patch("/api/issues/999/unresolve")
      .send(toggle)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Issue not found"
    })
  })
})
