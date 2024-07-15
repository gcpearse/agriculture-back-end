import data from "../../db/data/test-data/data-index"
import { db } from "../../db"
import { seed } from "../../db/seeding/seed"
import { checkPlotNameConflict, getValidPlotTypes, verifyPlotOwner } from "../../utils/db-query-utils"


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


describe("verifyPlotOwner", () => {

  test("Returns a plot object when the plot belongs to the current user", async () => {

    const result = await verifyPlotOwner(1, 1, "Test")

    console.log(result)
    expect(result).toMatchObject({
      plot_id: 1,
      owner_id: 1,
      name: "John's Garden",
      type: "garden",
      description: "A vegetable garden",
      location: "Farmville",
      area: 100
    })
  })

  test("When the plot does not belong to the current user, the promise is rejected", async () => {

    await expect(verifyPlotOwner(1, 2, "Permission denied")).rejects.toMatchObject({
      status: 403,
      message: "Forbidden",
      details: "Permission denied"
    })
  })
})
