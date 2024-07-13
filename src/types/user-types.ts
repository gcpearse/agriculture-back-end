export type Credentials = {
  username: string
  password: string
}


export type User = {
  user_id?: number
  first_name: string
  surname: string
  uses_metric: boolean
} & Credentials
