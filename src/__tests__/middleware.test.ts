import data from "../db/data/test-data/test-index"
import { db } from "../db"
import { seed } from "../db/seeding/seed"
import { app } from "../app"

import request from "supertest"

import { StatusResponse } from "../types/response-types"


beforeEach(() => seed(data))

afterAll(() => db.end())


describe("ANY /api/foobar", () => {

  test("GET:404 Responds with an error when the path is not found", async () => {

    const { body } = await request(app)
      .get("/api/foobar")
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Path not found"
    })
  })
})
