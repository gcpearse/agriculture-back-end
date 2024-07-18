export const verifyPermission = (base: string | number, target: string | number, details: string): Promise<never> | undefined => {

  if (base !== target) {
    return Promise.reject({
      status: 403,
      message: "Forbidden",
      details
    })
  }
}


export const verifyParamIsNumber = (param: number): Promise<never> | undefined => {

  if (isNaN(param)) {
    return Promise.reject({
      status: 400,
      message: "Bad Request",
      details: "Invalid parameter"
    })
  }
}
