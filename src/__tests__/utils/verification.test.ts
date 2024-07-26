import { StatusResponse } from "../../types/response-types"
import { verifyPermission, verifyParamIsPositiveInt, verifyPagination, verifyQueryValue } from "../../utils/verification"


describe("verifyPermission", () => {

  test("When the base value does not match the target value, the promise is rejected", () => {

    expect(verifyPermission(1, 2, "Test")).rejects.toMatchObject<StatusResponse>({
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

  test("Returns undefined when the query result returns at least one row", () => {

    expect(verifyPagination(2, 1)).toBeUndefined()
  })
})


describe("verifyParamIsPositiveInt", () => {

  test("When the value of the parameter is not a number (NaN), the promise is rejected", () => {

    expect(verifyParamIsPositiveInt(NaN)).rejects.toMatchObject<StatusResponse>({
      status: 400,
      message: "Bad Request",
      details: "Invalid parameter"
    })
  })

  test("When the value of the parameter is a negative number, the promise is rejected", () => {

    expect(verifyParamIsPositiveInt(-1)).rejects.toMatchObject<StatusResponse>({
      status: 400,
      message: "Bad Request",
      details: "Invalid parameter"
    })
  })

  test("When the value of the parameter is not an integer, the promise is rejected", () => {

    expect(verifyParamIsPositiveInt(1.1)).rejects.toMatchObject<StatusResponse>({
      status: 400,
      message: "Bad Request",
      details: "Invalid parameter"
    })
  })

  test("When the value of the parameter is zero, the promise is rejected", () => {

    expect(verifyParamIsPositiveInt(0)).rejects.toMatchObject<StatusResponse>({
      status: 400,
      message: "Bad Request",
      details: "Invalid parameter"
    })
  })

  test("Returns undefined when the value of the parameter is a positive integer", () => {

    expect(verifyParamIsPositiveInt(1)).toBeUndefined()
  })
})


describe("verifyQueryValue", () => {

  test("When the query value is not found in the array of valid values, the promise is rejected", () => {

    expect(verifyQueryValue(["foo", "bar"], "foobar")).rejects.toMatchObject<StatusResponse>({
      status: 404,
      message: "Not Found",
      details: "No results found for that query"
    })
  })

  test("Returns undefined when the query value is found in the array of valid values", () => {

    expect(verifyQueryValue(["foo", "bar"], "foo")).toBeUndefined()
  })
})
