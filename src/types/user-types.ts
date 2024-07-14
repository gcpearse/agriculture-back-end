export type Credentials = {
  username: string
  password: string
}


export type User = {
  user_id?: number
  first_name: string
  surname: string
  unit_preference: string
} & Credentials
