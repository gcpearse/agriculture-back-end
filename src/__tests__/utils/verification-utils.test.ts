import { verifyPermission, verifyResult } from "../../utils/verification-utils"


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


describe("verifyResult", () => {

  test("When passed a true Boolean value, the promise is rejected", () => {

    expect(verifyResult(true, "Test")).rejects.toMatchObject({
      status: 404,
      message: "Not Found",
      details: "Test"
    })
  })

  test("Returns undefined hen passed a false Boolean value", async () => {

    expect(verifyResult(false, "Test")).toBeUndefined()
  })
})
