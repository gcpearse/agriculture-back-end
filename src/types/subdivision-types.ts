export type Subdivision = {
  subdivision_id?: number
  plot_id: number
  name: string
  type: string
  description: string
  area: number | null
}


export type SubdivisionRequest = {
  name: string
  type: string
  description: string
  area?: number | null
}
