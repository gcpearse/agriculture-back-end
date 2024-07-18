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

  test("When the value of the parameter is not a number (NaN), the promise is rejected", () => {

    expect(verifyParamIsNumber(NaN)).rejects.toMatchObject({
      status: 400,
      message: "Bad Request",
      details: "Invalid parameter"
    })
  })

  test("Returns undefined when the value of the parameter is a number", () => {

    expect(verifyParamIsNumber(1)).toBeUndefined()
  })
})
