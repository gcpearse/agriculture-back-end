import data from "../db/data/test-data/test-index"
import { db } from "../db"
import { seed } from "../db/seeding/seed"
import request from "supertest"
import { app } from "../app"
import { CropNote } from "../types/note-types"
import { StatusResponse } from "../types/response-types"


let token: string

const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/


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

    for (const note of body.notes) {
      expect(note).toMatchObject<CropNote>({
        note_id: expect.any(Number),
        crop_id: 1,
        body: expect.any(String),
        created_at: expect.stringMatching(regex)
      })
    }
  })

  test("GET:200 Responds with an empty array when no crop notes are associated with the crop", async () => {

    const { body } = await request(app)
      .get("/api/crop_notes/crops/2")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(Array.isArray(body.notes)).toBe(true)

    expect(body.notes).toHaveLength(0)
  })

  test("GET:400 Responds with an error when the crop_id parameter is not a positive integer", async () => {

    const { body } = await request(app)
      .get("/api/crop_notes/crops/foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("GET:403 Responds with an error when the authenticated user attempts to retrieve another user's crop note data", async () => {

    const { body } = await request(app)
      .get("/api/crop_notes/crops/5")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("GET:404 Responds with an error when the crop does not exist", async () => {

    const { body } = await request(app)
      .get("/api/crop_notes/crops/7")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Crop not found"
    })
  })

  test("GET:404 When the parent crop is deleted, all child crop notes are also deleted", async () => {

    await request(app)
      .delete("/api/crops/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204)

    const { body } = await request(app)
      .get("/api/crop_notes/crops/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Crop not found"
    })
  })
})


describe("POST /api/crop_notes/crops/:crop_id", () => {

  test("POST:201 Responds with a new crop note object", async () => {

    const newNote = {
      body: "These carrots are ready to harvest."
    }

    const { body } = await request(app)
      .post("/api/crop_notes/crops/1")
      .send(newNote)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.note).toMatchObject<CropNote>({
      note_id: 6,
      crop_id: 1,
      body: "These carrots are ready to harvest.",
      created_at: expect.stringMatching(regex)
    })
  })

  test("POST:201 Ignores any unnecessary properties on the object", async () => {

    const newNote = {
      body: "These carrots are ready to harvest.",
      foo: "bar"
    }

    const { body } = await request(app)
      .post("/api/crop_notes/crops/1")
      .send(newNote)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)

    expect(body.note).toMatchObject<CropNote>({
      note_id: 6,
      crop_id: 1,
      body: "These carrots are ready to harvest.",
      created_at: expect.stringMatching(regex)
    })
  })

  test("POST:400 Responds with an error when a required property is missing from the request body", async () => {

    const newNote = {}

    const { body } = await request(app)
      .post("/api/crop_notes/crops/1")
      .send(newNote)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Not null violation"
    })
  })

  test("POST:400 Responds with an error when the crop_id parameter is not a positive integer", async () => {

    const newNote = {
      body: "These carrots are ready to harvest."
    }

    const { body } = await request(app)
      .post("/api/crop_notes/crops/foobar")
      .send(newNote)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("POST:400 Responds with an error when the authenticated user attempts to add a crop note for another user", async () => {

    const newNote = {
      body: "These are beautiful peaches."
    }

    const { body } = await request(app)
      .post("/api/crop_notes/crops/5")
      .send(newNote)
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("POST:404 Responds with an error when the crop does not exist", async () => {

    const newNote = {
      body: "These are beautiful peaches."
    }

    const { body } = await request(app)
      .post("/api/crop_notes/crops/999")
      .send(newNote)
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Crop not found"
    })
  })
})


describe("DELETE /api/crop_notes/crops/:crop_id", () => {

  test("DELETE:204 Deletes the crop notes associated with the given crop ID", async () => {

    await request(app)
      .delete("/api/crop_notes/crops/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204)

    const { body } = await request(app)
      .get("/api/crop_notes/crops/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    expect(Array.isArray(body.notes)).toBe(true)

    expect(body.notes).toHaveLength(0)
  })

  test("DELETE:400 Responds with an error when the crop_id parameter is not a positive integer", async () => {

    const { body } = await request(app)
      .delete("/api/crop_notes/crops/foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("DELETE:403 Responds with an error when the authenticated user attempts to delete another user's crop notes", async () => {

    const { body } = await request(app)
      .delete("/api/crop_notes/crops/5")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("DELETE:404 Responds with an error when the crop does not exist", async () => {

    const { body } = await request(app)
      .delete("/api/crop_notes/crops/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Crop not found"
    })
  })
})


describe("DELETE /api/crop_notes/crops/:crop_id", () => {

  test("DELETE:204 Deletes the crop note with the given note ID", async () => {

    await request(app)
      .delete("/api/crop_notes/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204)
  })

  test("DELETE:400 Responds with an error when the note_id parameter is not a positive integer", async () => {

    const { body } = await request(app)
      .delete("/api/crop_notes/foobar")
      .set("Authorization", `Bearer ${token}`)
      .expect(400)

    expect(body).toMatchObject<StatusResponse>({
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("DELETE:403 Responds with an error when the authenticated user attempts to delete another user's crop notes", async () => {

    const { body } = await request(app)
      .delete("/api/crop_notes/5")
      .set("Authorization", `Bearer ${token}`)
      .expect(403)

    expect(body).toMatchObject<StatusResponse>({
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("DELETE:404 Responds with an error when the crop does not exist", async () => {

    const { body } = await request(app)
      .delete("/api/crop_notes/crops/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404)

    expect(body).toMatchObject<StatusResponse>({
      message: "Not Found",
      details: "Crop not found"
    })
  })
})
