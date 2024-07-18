import { verifyPermission, verifyParamIsNumber } from "../../utils/verification-utils"


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


describe("verifyParamIsNumber", () => {

  test("When the query parameter is not a number (NaN), the promise is rejected", () => {

    expect(verifyParamIsNumber(NaN, "Test")).rejects.toMatchObject({
      status: 404,
      message: "Not Found",
      details: "Test"
    })
  })

  test("Returns undefined when the base value matches the target value", () => {

    expect(verifyParamIsNumber(1, "Test")).toBeUndefined()
  })
})
