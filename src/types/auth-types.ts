import { Request } from "express"


export type AuthUser = {
  user?: {
    user_id: number
    username: string
    iat: number
    exp: number
  }
}


export type ExtendedRequest = AuthUser & Request
