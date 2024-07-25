export type Plot = {
  plot_id?: number
  owner_id: number
  name: string
  type: string
  description: string
  location: string
  area: number | null
}


export type ExtendedPlot = {
  image_count: number
  subdivision_count: number
  crop_count: number
  issue_count: number
  job_count: number
} & Plot


export type PlotRequest = {
  name: string
  type: string
  description: string
  location: string
  area?: number | null
}
