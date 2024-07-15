export const verifyPermission = (base: string | number, target: string | number, details: string): Promise<never> | undefined => {

  if (base !== target) {
    return Promise.reject({
      status: 403,
      message: "Forbidden",
      details
    })
  }
}


export const verifyResult = (bool: boolean, details: string): Promise<never> | undefined => {

  if (bool) {
    return Promise.reject({
      status: 404,
      message: "Not Found",
      details
    })
  }
}
