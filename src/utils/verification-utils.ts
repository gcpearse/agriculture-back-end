export const verifyPermission = (base: string | number, target: string | number, details: string): Promise<never> | undefined => {

  if (base !== target) {
    return Promise.reject({
      status: 403,
      message: "Forbidden",
      details
    })
  }
}


export const verifyParamIsPositiveInt = (param: number): Promise<never> | undefined => {

  if (isNaN(param) || param < 1 || Math.floor(param) !== param) {
    return Promise.reject({
      status: 400,
      message: "Bad Request",
      details: "Invalid parameter"
    })
  }
}
