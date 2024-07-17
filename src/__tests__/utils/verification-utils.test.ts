import { verifyPermission } from "../../utils/verification-utils"


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
