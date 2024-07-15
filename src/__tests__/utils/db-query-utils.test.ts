import data from "../../db/data/test-data/data-index"
import { db } from "../../db"
import { seed } from "../../db/seeding/seed"
import { checkPlotNameConflict, getPlotOwnerId, getValidPlotTypes } from "../../utils/db-query-utils"


beforeEach(() => seed(data))

afterAll(() => db.end())


describe("getValidPlotTypes", () => {

  test("Returns a string array of plot types associated with the given user", async () => {

    const result = await getValidPlotTypes(1)

    expect(result).toEqual(["allotment", "garden"])
  })

  test("Returns an empty array when no plots are associated with the owner_id", async () => {

    const result = await getValidPlotTypes(3)

    expect(result).toEqual([])
  })
})


describe("checkPlotNameConflict", () => {

  test("When a plot name conflict is found, the promise is rejected", async () => {

    await expect(checkPlotNameConflict(1, "John's Garden")).rejects.toMatchObject({
      status: 409,
      message: "Conflict",
      details: "Plot name already exists"
    })
  })

  test("When no plot name conflict is found, the promise resolves to be undefined", async () => {

    await expect(checkPlotNameConflict(1, "Unique Name")).resolves.toBeUndefined()
  })
})


describe("getPlotOwnerId", () => {

  test("Returns a the owner_id associated with the plot", async () => {

    const result = await getPlotOwnerId(1)

    expect(result).toBe(1)
  })

  test("Returns an empty array when no plots are associated with the owner_id", async () => {

    await expect(getPlotOwnerId(10)).rejects.toMatchObject({
      status: 404,
      message: "Not Found",
      details: "Plot not found"
    })
  })
})
