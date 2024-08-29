import data from "../../db/data/test-data/test-index"
import { db } from "../../db"
import { seed } from "../../db/seeding/seed"
import { checkForEmailConflict, checkForPlotNameConflict, checkForSubdivisionNameConflict, fetchCropOwnerId, fetchPlotOwnerId, fetchSubdivisionPlotId, fetchUserRole, searchForUserId, confirmCropCategoryIsValid, confirmPlotTypeIsValid, confirmSubdivisionTypeIsValid, confirmUnitSystemIsValid, confirmUserRoleIsValid } from "../../utils/db-queries"
import { StatusResponse } from "../../types/response-types"


beforeEach(() => seed(data))

afterAll(() => db.end())


describe("checkForEmailConflict", () => {

  test("When an email conflict is found, the promise is rejected", async () => {

    await expect(checkForEmailConflict("john.smith@example.com")).rejects.toMatchObject<StatusResponse>({
      status: 409,
      message: "Conflict",
      details: "Email already exists"
    })
  })

  test("When no email conflict is found, the promise resolves to be undefined", async () => {

    await expect(checkForEmailConflict("foobar@foobar.com")).resolves.toBeUndefined()
  })
})


describe("checkForPlotNameConflict", () => {

  test("When a plot name conflict is found, the promise is rejected", async () => {

    await expect(checkForPlotNameConflict(1, "John's Garden")).rejects.toMatchObject<StatusResponse>({
      status: 409,
      message: "Conflict",
      details: "Plot name already exists"
    })
  })

  test("When no plot name conflict is found, the promise resolves to be undefined", async () => {

    await expect(checkForPlotNameConflict(1, "Foobar")).resolves.toBeUndefined()
  })
})


describe("checkForSubdivisionNameConflict", () => {

  test("When a subdivision name conflict is found, the promise is rejected", async () => {

    await expect(checkForSubdivisionNameConflict(1, "Onion Bed")).rejects.toMatchObject<StatusResponse>({
      status: 409,
      message: "Conflict",
      details: "Subdivision name already exists"
    })
  })

  test("When no subdivision name conflict is found, the promise resolves to be undefined", async () => {

    await expect(checkForSubdivisionNameConflict(1, "Foobar")).resolves.toBeUndefined()
  })
})


describe("fetchCropOwnerId", () => {

  test("Returns the owner ID associated with the crop", async () => {

    const result = await fetchCropOwnerId(1)

    expect(result).toBe(1)
  })

  test("When the crop does not exist, the promise is rejected", async () => {

    await expect(fetchCropOwnerId(999)).rejects.toMatchObject<StatusResponse>({
      status: 404,
      message: "Not Found",
      details: "Crop not found"
    })
  })
})


describe("fetchPlotOwnerId", () => {

  test("Returns the owner ID associated with the plot", async () => {

    const result = await fetchPlotOwnerId(1)

    expect(result).toBe(1)
  })

  test("When the plot does not exist, the promise is rejected", async () => {

    await expect(fetchPlotOwnerId(999)).rejects.toMatchObject<StatusResponse>({
      status: 404,
      message: "Not Found",
      details: "Plot not found"
    })
  })
})


describe("fetchSubdivisionPlotId", () => {

  test("Returns the plot ID associated with the subdivision", async () => {

    const result = await fetchSubdivisionPlotId(1)

    expect(result).toBe(1)
  })

  test("When the subdivision does not exist, the promise is rejected", async () => {

    await expect(fetchSubdivisionPlotId(999)).rejects.toMatchObject<StatusResponse>({
      status: 404,
      message: "Not Found",
      details: "Subdivision not found"
    })
  })
})


describe("fetchUserRole", () => {

  test("Returns the role of the user with the given user ID", async () => {

    const result = await fetchUserRole(1)

    expect(result).toBe("admin")
  })

  test("When the user does not exist, the promise is rejected", async () => {

    await expect(fetchUserRole(999)).rejects.toMatchObject<StatusResponse>({
      status: 404,
      message: "Not Found",
      details: "User not found"
    })
  })
})


describe("searchForUserId", () => {

  test("When a user ID matching the owner_id parameter cannot be found, the promise is rejected", async () => {

    await expect(searchForUserId(999)).rejects.toMatchObject<StatusResponse>({
      status: 404,
      message: "Not Found",
      details: "User not found"
    })
  })

  test("When a user ID matching the owner_id parameter is found, the promise resolves to be undefined", async () => {

    await expect(searchForUserId(1)).resolves.toBeUndefined()
  })
})


describe("confirmCropCategoryIsValid", () => {

  test("Returns true when the crop category is valid with case-insensitivity enabled", async () => {

    const result = await confirmCropCategoryIsValid("fruits", true)

    expect(result).toBe(true)
  })

  test("Returns false when the crop category is invalid", async () => {

    const result = await confirmCropCategoryIsValid("fruits", false)

    expect(result).toBe(false)
  })
})


describe("confirmPlotTypeIsValid", () => {

  test("Returns true when the plot type is valid with case-insensitivity enabled", async () => {

    const result = await confirmPlotTypeIsValid("field", true)

    expect(result).toBe(true)
  })

  test("Returns false when the plot type is invalid", async () => {

    const result = await confirmPlotTypeIsValid("field", false)

    expect(result).toBe(false)
  })
})


describe("confirmSubdivisionTypeIsValid", () => {

  test("Returns true when the plot type is valid with case-insensitivity enabled", async () => {

    const result = await confirmSubdivisionTypeIsValid("bed", true)

    expect(result).toBe(true)
  })

  test("Returns false when the plot type is invalid", async () => {

    const result = await confirmSubdivisionTypeIsValid("bed", false)

    expect(result).toBe(false)
  })
})


describe("confirmUnitSystemIsValid", () => {

  test("When the unit system is invalid, the promise is rejected", async () => {

    await expect(confirmUnitSystemIsValid("foobar")).rejects.toMatchObject<StatusResponse>({
      status: 400,
      message: "Bad Request",
      details: "Invalid unit system"
    })
  })

  test("When the unit system is valid, the promise resolves to be undefined", async () => {

    await expect(confirmUnitSystemIsValid("metric")).resolves.toBeUndefined()
  })
})


describe("confirmUserRoleIsValid", () => {

  test("When the user role is invalid, the promise is rejected", async () => {

    await expect(confirmUserRoleIsValid("foobar")).rejects.toMatchObject<StatusResponse>({
      status: 400,
      message: "Bad Request",
      details: "Invalid user role"
    })
  })

  test("When the user role is valid, the promise resolves to be undefined", async () => {

    await expect(confirmUserRoleIsValid("admin")).resolves.toBeUndefined()
  })
})
