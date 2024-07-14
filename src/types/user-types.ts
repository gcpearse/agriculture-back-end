export type Credentials = {
  username: string
  password: string
}


export enum UnitSystem {
  Metric = "metric",
  Imperial = "imperial"
}


export type User = {
  user_id?: number
  first_name: string
  surname: string
  unit_preference: UnitSystem
} & Credentials
