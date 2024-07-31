export type Username = {
  username: string
}


export type Password = {
  password: string
}


export type Credentials = {
  login: string
} & Password


export type LoggedInUser = {
  user_id: number
} & Username


export enum UserRole {
  Admin = "admin",
  Supervisor = "supervisor",
  User = "user"
}


export enum UnitSystem {
  Metric = "metric",
  Imperial = "imperial"
}


export type SecureUser = {
  user_id?: number
  email: string
  first_name: string
  surname: string
  role: UserRole
  unit_preference: UnitSystem
} & Username


export type User = {
  token: string | null
  token_expiry: string | null
} & SecureUser & Password


export type PasswordUpdate = {
  oldPassword: string,
  newPassword: string
}
