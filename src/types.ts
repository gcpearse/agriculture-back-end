export type User = {
  user_id?: number,
  username: string
  password: string
  first_name: string
  surname: string
  uses_metric: boolean
}


export type Plot = {
  plot_id?: number,
  owner_id: number
  name: string
  type: string
  description: string
  location: string
  area: number | null
}


export type PlotImage = {
  image_id?: number,
  plot_id: number,
  image_url: string
}


export type Crop = {
  crop_id?: number
  plot_id: number
  name: string
  variety: string | null
  quantity: number | null
  date_planted: Date
  harvest_date: Date
}
