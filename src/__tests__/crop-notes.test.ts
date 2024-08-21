import data from "../db/data/test-data/test-index"
import { db } from "../db"
import { seed } from "../db/seeding/seed"
import request from "supertest"
import { app } from "../app"


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


describe("GET /api/crop_notes/crops/:crop_id", () => {

  test("GET:200 Responds with an array of crop note objects", async () => {

    const { body } = await request(app)
      .get("/api/crop_notes/crops/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    console.log(body.cropNotes)
  })
})
