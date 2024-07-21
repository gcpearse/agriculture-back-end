export const verifyPagination = (page: number, limit: number, count: number): Promise<never> | undefined => {

  if (page > 1 && (limit * page - limit) >= count) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "Page not found"
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


export const verifyPermission = (base: string | number, target: string | number, details: string): Promise<never> | undefined => {

  if (base !== target) {
    return Promise.reject({
      status: 403,
      message: "Forbidden",
      details
    })
  }
}
