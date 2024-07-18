export type Username = {
  username: string
}


export type Password = {
  password: string
}


export type Credentials = Username & Password


export type LoggedInUser = {
  user_id: number
} & Username


export enum UnitSystem {
  Metric = "metric",
  Imperial = "imperial"
}


export type SecureUser = {
  user_id?: number
  email: string
  first_name: string
  surname: string
  unit_preference: UnitSystem
} & Username


export type User = SecureUser & Password
