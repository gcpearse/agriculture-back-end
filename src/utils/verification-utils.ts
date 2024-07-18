export const verifyPermission = (base: string | number, target: string | number, details: string): Promise<never> | undefined => {

  if (base !== target) {
    return Promise.reject({
      status: 403,
      message: "Forbidden",
      details
    })
  }
}


export const verifyParamIsNumber = (queryParam: number, details: string): Promise<never> | undefined => {

  if (isNaN(queryParam)) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details
    })
  }
}
