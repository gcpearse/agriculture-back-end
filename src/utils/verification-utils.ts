export const verifyPermission = (base: string | number, target: string | number, details: string): Promise<never> | undefined => {

  if (base !== target) {
    return Promise.reject({
      status: 403,
      message: "Forbidden",
      details
    })
  }
}


export const verifyQueryParamIsNumber = (queryParams: number, details: string): Promise<never> | undefined => {

  if (isNaN(queryParams)) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details
    })
  }
}
