import data from "../../db/data/test-data/test-index"
import { db } from "../../db"
import { seed } from "../../db/seeding/seed"
import { checkEmailConflict, checkPlotNameConflict, checkSubdivisionNameConflict, getCropOwnerId, getPlotOwnerId, getSubdivisionPlotId, getUserRole, searchForUserId, searchForUsername, validateCropCategory, validatePlotType, validateSubdivisionType } from "../../utils/db-queries"
import { StatusResponse } from "../../types/response-types"


beforeEach(() => seed(data))

afterAll(() => db.end())


describe("checkEmailConflict", () => {

  test("When an email conflict is found, the promise is rejected", async () => {

    await expect(checkEmailConflict("john.smith@example.com")).rejects.toMatchObject<StatusResponse>({
      status: 409,
      message: "Conflict",
      details: "Email already exists"
    })
  })

  test("When no plot name conflict is found, the promise resolves to be undefined", async () => {

    await expect(checkEmailConflict("foobar@foobar.com")).resolves.toBeUndefined()
  })
})


describe("checkPlotNameConflict", () => {

  test("When a plot name conflict is found, the promise is rejected", async () => {

    await expect(checkPlotNameConflict(1, "John's Garden")).rejects.toMatchObject<StatusResponse>({
      status: 409,
      message: "Conflict",
      details: "Plot name already exists"
    })
  })

  test("When no plot name conflict is found, the promise resolves to be undefined", async () => {

    await expect(checkPlotNameConflict(1, "Foobar")).resolves.toBeUndefined()
  })
})


describe("checkSubdivisionNameConflict", () => {

  test("When a subdivision name conflict is found, the promise is rejected", async () => {

    await expect(checkSubdivisionNameConflict(1, "Onion Bed")).rejects.toMatchObject<StatusResponse>({
      status: 409,
      message: "Conflict",
      details: "Subdivision name already exists"
    })
  })

  test("When no plot name conflict is found, the promise resolves to be undefined", async () => {

    await expect(checkSubdivisionNameConflict(1, "Foobar")).resolves.toBeUndefined()
  })
})


describe("getCropOwnerId", () => {

  test("Returns the owner_id associated with the crop", async () => {

    const result = await getCropOwnerId(1)

    expect(result).toBe(1)
  })

  test("Returns an error message when the crop_id does not exist", async () => {

    await expect(getCropOwnerId(999)).rejects.toMatchObject<StatusResponse>({
      status: 404,
      message: "Not Found",
      details: "Crop not found"
    })
  })
})


describe("getPlotOwnerId", () => {

  test("Returns the owner_id associated with the plot", async () => {

    const result = await getPlotOwnerId(1)

    expect(result).toBe(1)
  })

  test("Returns an error message when the plot_id does not exist", async () => {

    await expect(getPlotOwnerId(999)).rejects.toMatchObject<StatusResponse>({
      status: 404,
      message: "Not Found",
      details: "Plot not found"
    })
  })
})


describe("getSubdivisionPlotId", () => {

  test("Returns the plot_id associated with the subdivision", async () => {

    const result = await getSubdivisionPlotId(1)

    expect(result).toBe(1)
  })

  test("Returns an error message when the subdivision_id does not exist", async () => {

    await expect(getSubdivisionPlotId(999)).rejects.toMatchObject<StatusResponse>({
      status: 404,
      message: "Not Found",
      details: "Subdivision not found"
    })
  })
})


describe("getUserRole", () => {

  test("Returns the role of the user with the given user_id", async () => {

    const result = await getUserRole(1)

    expect(result).toBe("admin")
  })

  test("Returns an error message when the subdivision_id does not exist", async () => {

    await expect(searchForUserId(999)).rejects.toMatchObject<StatusResponse>({
      status: 404,
      message: "Not Found",
      details: "User not found"
    })
  })
})


describe("searchForUserId", () => {

  test("When a user_id matching the owner_id cannot be found, the promise is rejected", async () => {

    await expect(searchForUserId(999)).rejects.toMatchObject<StatusResponse>({
      status: 404,
      message: "Not Found",
      details: "User not found"
    })
  })

  test("When a user_id matching the owner_id is found, the promise resolves to be undefined", async () => {

    await expect(searchForUserId(1)).resolves.toBeUndefined()
  })
})


describe("searchForUsername", () => {

  test("When a match for the username cannot be found, the promise is rejected", async () => {

    await expect(searchForUsername("Foobar")).rejects.toMatchObject<StatusResponse>({
      status: 404,
      message: "Not Found",
      details: "User not found"
    })
  })

  test("When a match for the username is found, the promise resolves to be undefined", async () => {

    await expect(searchForUsername("carrot_king")).resolves.toBeUndefined()
  })
})


describe("validateCropCategory", () => {

  test("Returns true when the crop category is valid with case-insensitivity enabled", async () => {

    const result = await validateCropCategory("fruits", true)

    expect(result).toBe(true)
  })

  test("Returns false when the crop category is invalid", async () => {

    const result = await validateCropCategory("fruits", false)

    expect(result).toBe(false)
  })
})


describe("validatePlotType", () => {

  test("Returns true when the plot type is valid with case-insensitivity enabled", async () => {

    const result = await validatePlotType("field", true)

    expect(result).toBe(true)
  })

  test("Returns false when the plot type is invalid", async () => {

    const result = await validatePlotType("field", false)

    expect(result).toBe(false)
  })
})


describe("validateSubdivisionType", () => {

  test("Returns true when the plot type is valid with case-insensitivity enabled", async () => {

    const result = await validateSubdivisionType("bed", true)

    expect(result).toBe(true)
  })

  test("Returns false when the plot type is invalid", async () => {

    const result = await validateSubdivisionType("bed", false)

    expect(result).toBe(false)
  })
})
