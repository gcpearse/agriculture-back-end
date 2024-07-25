export type Subdivision = {
  subdivision_id?: number
  plot_id: number
  name: string
  type: string
  description: string
  area: number | null
}


export type ExtendedSubdivision = {
  image_count: number
  crop_count: number
  issue_count: number
  job_count: number
} & Subdivision


export type SubdivisionRequest = {
  name: string
  type: string
  description: string
  area?: number | null
}
