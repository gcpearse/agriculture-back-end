export type Crop = {
  crop_id?: number
  plot_id: number
  subdivision_id: number | null
  name: string
  variety: string | null
  quantity: number | null
  date_planted: Date
  harvest_date: Date
}
