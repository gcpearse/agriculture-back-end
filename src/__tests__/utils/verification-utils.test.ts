import { verifyPermission, verifyQueryParamIsNumber } from "../../utils/verification-utils"


describe("verifyPermission", () => {

  test("When the base value does not match the target value, the promise is rejected", () => {

    expect(verifyPermission(1, 2, "Test")).rejects.toMatchObject({
      status: 403,
      message: "Forbidden",
      details: "Test"
    })
  })

  test("Returns undefined when the base value matches the target value", () => {

    expect(verifyPermission(1, 1, "Test")).toBeUndefined()
  })
})


describe("verifyQueryParamIsNumber", () => {

  test("When the query parameter is not a number (NaN), the promise is rejected", () => {

    expect(verifyQueryParamIsNumber(NaN, "Test")).rejects.toMatchObject({
      status: 404,
      message: "Not Found",
      details: "Test"
    })
  })

  test("Returns undefined when the base value matches the target value", () => {

    expect(verifyQueryParamIsNumber(1, "Test")).toBeUndefined()
  })
})
