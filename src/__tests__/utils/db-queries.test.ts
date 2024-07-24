import data from "../../db/data/test-data/test-index"
import { db } from "../../db"
import { seed } from "../../db/seeding/seed"
import { checkPlotNameConflict, getPlotOwnerId } from "../../utils/db-queries"


beforeEach(() => seed(data))

afterAll(() => db.end())


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

  test("Returns the owner_id associated with the plot", async () => {

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
