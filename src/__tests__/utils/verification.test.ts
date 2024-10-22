import { StatusResponse } from "../../types/response-types"
import { verifyPermission, verifyValueIsPositiveInt, verifyPagination, verifyQueryValue, verifyPasswordFormat, verifyBooleanValue } from "../../utils/verification"


describe("verifyBooleanValue", () => {

  test("When the actual value does not match the expected value, the promise is rejected", () => {

    expect(verifyBooleanValue(false, true)).rejects.toMatchObject<StatusResponse>({
      status: 400,
      message: "Bad Request",
      details: "Invalid boolean value"
    })
  })

  test("Returns undefined when the actual value matches the expected value", () => {

    expect(verifyBooleanValue(true, true)).toBeUndefined()
  })
})


describe("verifyPagination", () => {

  test("When the page number is greater than one and the query result returns no rows, the promise is rejected", () => {

    expect(verifyPagination(2, 0)).rejects.toMatchObject<StatusResponse>({
      status: 404,
      message: "Not Found",
      details: "Page not found"
    })
  })

  test("Returns undefined when the page number is one", () => {

    expect(verifyPagination(1, 0)).toBeUndefined()
  })

  test("Returns undefined when the query returns at least one row", () => {

    expect(verifyPagination(2, 1)).toBeUndefined()
  })
})


describe("verifyPasswordFormat", () => {

  test("When the password format is invalid, the promise is rejected", () => {

    const invalidPasswords = [
      "",
      "Abcdef1",
      "Abcdef1!",
      "abcdefgh",
      "Abcdefgh",
      "abcdefg1",
      "Abcdefghijklmnopqrstuvwzyx1",
    ]

    for (const password of invalidPasswords) {
      expect(verifyPasswordFormat(password)).rejects.toMatchObject<StatusResponse>({
        status: 400,
        message: "Bad Request",
        details: "Invalid password format"
      })
    }
  })

  test("Returns undefined when the password format is valid", () => {

    const validPasswords = [
      "Abcd1234",
      "Abcd_123",
      "Abcdefghijklmnopq1"
    ]

    for (const password of validPasswords) {
      expect(verifyPasswordFormat(password)).toBeUndefined()
    }
  })
})


describe("verifyPermission", () => {

  test("When the base value does not match the target value, the promise is rejected", () => {

    expect(verifyPermission(1, 2)).rejects.toMatchObject<StatusResponse>({
      status: 403,
      message: "Forbidden",
      details: "Permission denied"
    })
  })

  test("Returns undefined when the base value matches the target value", () => {

    expect(verifyPermission(1, 1)).toBeUndefined()
  })
})


describe("verifyValueIsPositiveInt", () => {

  test("When the value of the parameter is not a number (NaN), the promise is rejected", () => {

    expect(verifyValueIsPositiveInt(NaN)).rejects.toMatchObject<StatusResponse>({
      status: 400,
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("When the value of the parameter is a negative number, the promise is rejected", () => {

    expect(verifyValueIsPositiveInt(-1)).rejects.toMatchObject<StatusResponse>({
      status: 400,
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("When the value of the parameter is not an integer, the promise is rejected", () => {

    expect(verifyValueIsPositiveInt(1.1)).rejects.toMatchObject<StatusResponse>({
      status: 400,
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("When the value of the parameter is zero, the promise is rejected", () => {

    expect(verifyValueIsPositiveInt(0)).rejects.toMatchObject<StatusResponse>({
      status: 400,
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  })

  test("Returns undefined when the value of the parameter is a positive integer", () => {

    expect(verifyValueIsPositiveInt(1)).toBeUndefined()
  })
})


describe("verifyQueryValue", () => {

  test("When the query value is not found in the array of valid values, the promise is rejected", () => {

    expect(verifyQueryValue(["foo", "bar"], "foobar")).rejects.toMatchObject<StatusResponse>({
      status: 400,
      message: "Bad Request",
      details: "Invalid query value"
    })
  })

  test("Returns undefined when the query value is found in the array of valid values", () => {

    expect(verifyQueryValue(["foo", "bar"], "foo")).toBeUndefined()
  })
})
