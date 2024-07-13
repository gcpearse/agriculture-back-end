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


export type IssueImage = {
  issue_id: number
} & Image


export type JobImage = {
  job_id: number
} & Image
