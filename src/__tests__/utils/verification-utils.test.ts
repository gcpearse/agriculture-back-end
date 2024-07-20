import { verifyPermission, verifyParamIsPositiveInt, verifyPagination } from "../../utils/verification-utils"


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


describe("verifyPagination", () => {

  test("When the page exceeds the possible range, the promise is rejected", () => {

    expect(verifyPagination(3, 5, 10)).rejects.toMatchObject({
      status: 404,
      message: "Not Found",
      details: "Page not found"
    })
  })

  test("Returns undefined when the page falls with the possible range", () => {

    expect(verifyPagination(2, 5, 10)).toBeUndefined()
  })
})


describe("verifyParamIsPositiveInt", () => {

  test("When the value of the parameter is not a number (NaN), the promise is rejected", () => {

    expect(verifyParamIsPositiveInt(NaN)).rejects.toMatchObject({
      status: 400,
      message: "Bad Request",
      details: "Invalid parameter"
    })
  })

  test("When the value of the parameter is a negative number, the promise is rejected", () => {

    expect(verifyParamIsPositiveInt(-1)).rejects.toMatchObject({
      status: 400,
      message: "Bad Request",
      details: "Invalid parameter"
    })
  })

  test("When the value of the parameter is not an integer, the promise is rejected", () => {

    expect(verifyParamIsPositiveInt(1.1)).rejects.toMatchObject({
      status: 400,
      message: "Bad Request",
      details: "Invalid parameter"
    })
  })

  test("Returns undefined when the value of the parameter is a number", () => {

    expect(verifyParamIsPositiveInt(1)).toBeUndefined()
  })
})
