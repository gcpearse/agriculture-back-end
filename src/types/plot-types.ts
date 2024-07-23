export type Plot = {
  plot_id?: number
  owner_id: number
  name: string
  type: string
  description: string
  location: string
  area: number | null
}


export type PlotRequest = {
  name: string
  type: string
  description: string
  location: string
  area?: number | null
}
