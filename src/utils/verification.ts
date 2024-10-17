export const verifyPagination = (
  page: number,
  queryResultRowsLength: number
): Promise<never> | undefined => {

  if (page > 1 && !queryResultRowsLength) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details: "Page not found"
    })
  }
}


export const verifyPasswordFormat = (
  password: string
): Promise<never> | undefined => {
  // 8-18 chars: letters, numbers, underscores
  // At least one of: uppercase letter, lowercase letter, number
  if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[\w\d]{8,18}$/.test(password)) {
    return Promise.reject({
      status: 400,
      message: "Bad Request",
      details: "Invalid password format"
    })
  }
}


export const verifyPermission = (
  base: string | number,
  target: string | number
): Promise<never> | undefined => {

  if (base !== target) {
    return Promise.reject({
      status: 403,
      message: "Forbidden",
      details: "Permission denied"
    })
  }
}


export const verifyQueryValue = (
  validValues: string[],
  queryValue: string
): Promise<never> | undefined => {

  if (!validValues.includes(queryValue)) {
    return Promise.reject({
      status: 400,
      message: "Bad Request",
      details: "Invalid query value"
    })
  }
}


export const verifyValueIsPositiveInt = (
  value: number
): Promise<never> | undefined => {

  if (isNaN(value) || value < 1 || Math.floor(value) !== value) {
    return Promise.reject({
      status: 400,
      message: "Bad Request",
      details: "Value must be a positive integer"
    })
  }
}
