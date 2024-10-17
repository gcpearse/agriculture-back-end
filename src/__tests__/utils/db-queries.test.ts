import data from "../../db/data/test-data/test-index"
import { db } from "../../db"
import { seed } from "../../db/seeding/seed"
import { checkForEmailConflict, checkForPlotNameConflict, checkForSubdivisionNameConflict, fetchCropOwnerId, fetchPlotOwnerId, fetchSubdivisionPlotId, fetchUserRole, searchForUserId, confirmCropCategoryIsValid, confirmPlotTypeIsValid, confirmSubdivisionTypeIsValid, confirmUnitSystemIsValid, confirmUserRoleIsValid, fetchCropNoteCropId, fetchIssueOwnerId } from "../../utils/db-queries"
import { StatusResponse } from "../../types/response-types"


beforeEach(() => seed(data))

afterAll(() => db.end())


describe("checkForEmailConflict", () => {

  test("When an email conflict is found, the promise is rejected", async () => {

    await expect(checkForEmailConflict("john.smith@example.com", undefined)).rejects.toMatchObject<StatusResponse>({
      status: 409,
      message: "Conflict",
      details: "Email already exists"
    })
  })

  test("When no email conflict is found, the promise resolves to be undefined", async () => {

    await Promise.all([
      expect(checkForEmailConflict("foobar@foobar.com", undefined)).resolves.toBeUndefined(),
      expect(checkForEmailConflict("john.smith@example.com", 1)).resolves.toBeUndefined()
    ])
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


describe("fetchCropNoteCropId", () => {

  test("Returns the crop ID associated with the crop note", async () => {

    await Promise.all([
      expect(fetchCropNoteCropId(1)).resolves.toBe(1),
      expect(fetchCropNoteCropId(2)).resolves.toBe(1)
    ])
  })

  test("When the crop note does not exist, the promise is rejected", async () => {

    await expect(fetchCropNoteCropId(999)).rejects.toMatchObject<StatusResponse>({
      status: 404,
      message: "Not Found",
      details: "Crop note not found"
    })
  })
})


describe("fetchCropOwnerId", () => {

  test("Returns the owner ID associated with the crop", async () => {

    await Promise.all([
      expect(fetchCropOwnerId(1)).resolves.toBe(1),
      expect(fetchCropOwnerId(5)).resolves.toBe(2)
    ])
  })

  test("When the crop does not exist, the promise is rejected", async () => {

    await expect(fetchCropOwnerId(999)).rejects.toMatchObject<StatusResponse>({
      status: 404,
      message: "Not Found",
      details: "Crop not found"
    })
  })
})


describe("fetchIssueOwnerId", () => {

  test("Returns the owner ID associated with the issue", async () => {
    await Promise.all([
      expect(fetchIssueOwnerId(1)).resolves.toBe(1),
      expect(fetchIssueOwnerId(4)).resolves.toBe(2)
    ])
  })

  test("When the issue does not exist, the promise is rejected", async () => {

    await expect(fetchIssueOwnerId(999)).rejects.toMatchObject<StatusResponse>({
      status: 404,
      message: "Not Found",
      details: "Issue not found"
    })
  })
})


describe("fetchPlotOwnerId", () => {

  test("Returns the owner ID associated with the plot", async () => {

    await Promise.all([
      expect(fetchPlotOwnerId(1)).resolves.toBe(1),
      expect(fetchPlotOwnerId(2)).resolves.toBe(2)
    ])
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

    await Promise.all([
      expect(fetchSubdivisionPlotId(1)).resolves.toBe(1),
      expect(fetchSubdivisionPlotId(4)).resolves.toBe(2)
    ])
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

    await Promise.all([
      expect(fetchUserRole(1)).resolves.toBe("admin"),
      expect(fetchUserRole(2)).resolves.toBe("user"),
    ])
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

  test("When the crop category is invalid, the promise is rejected", async () => {

    await expect(confirmCropCategoryIsValid("fruits", false)).rejects.toMatchObject<StatusResponse>({
      status: 400,
      message: "Bad Request",
      details: "Invalid crop category"
    })
  })

  test("When the crop category is valid with case-insensitivity enabled, the promise resolves to be undefined", async () => {

    await expect(confirmCropCategoryIsValid("fruits", true)).resolves.toBeUndefined()
  })
})


describe("confirmPlotTypeIsValid", () => {

  test("When the plot type is invalid, the promise is rejected", async () => {

    await expect(confirmPlotTypeIsValid("field", false)).rejects.toMatchObject<StatusResponse>({
      status: 400,
      message: "Bad Request",
      details: "Invalid plot type"
    })
  })

  test("When the plot type is valid with case-insensitivity enabled, the promise resolves to be undefined", async () => {

    await expect(confirmPlotTypeIsValid("field", true)).resolves.toBeUndefined()
  })
})


describe("confirmSubdivisionTypeIsValid", () => {

  test("When the subdivision type is invalid, the promise is rejected", async () => {

    await expect(confirmSubdivisionTypeIsValid("bed", false)).rejects.toMatchObject<StatusResponse>({
      status: 400,
      message: "Bad Request",
      details: "Invalid subdivision type"
    })
  })

  test("When the subdivision type is valid with case-insensitivity enabled, the promise resolves to be undefined", async () => {

    await expect(confirmSubdivisionTypeIsValid("bed", true)).resolves.toBeUndefined()
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
