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


export type UserRequest = {
  email: string
  first_name: string
  surname: string
  unit_system: UnitSystem
}


export type UnregisteredUser = UserRequest & Username & Password


export type SecureUser = {
  user_id?: number
  email: string
  first_name: string
  surname: string
  role: UserRole
  unit_system: UnitSystem
} & Username


export type User = {
  token: string | null
  token_expiry: string | null
} & SecureUser & Password


export type PasswordUpdate = {
  oldPassword: string,
  newPassword: string
}
