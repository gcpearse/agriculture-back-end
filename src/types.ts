export type User = {
  user_id?: number
  username: string
  password: string
  first_name: string
  surname: string
  uses_metric: boolean
}


export type Plot = {
  plot_id?: number
  owner_id: number
  name: string
  type: string
  description: string
  location: string
  area: number | null
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


export type Issue = {
  issue_id?: number
  plot_id: number
  title: string
  description: string
  is_resolved: boolean
}


type Comment = {
  comment_id?: number
  body: string
  created_at: string
}

export type CropComment = {
  crop_id: number
} & Comment

export type IssueComment = {
  issue_id: number
} & Comment


type Image = {
  image_id?: number
  image_url: string
}

export type PlotImage = {
  plot_id: number
} & Image

export type CropImage = {
  crop_id: number
} & Image
