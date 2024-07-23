export type Crop = {
  crop_id?: number
  plot_id: number
  subdivision_id: number | null
  name: string
  variety: string | null
  quantity: number | null
  date_planted: Date | null
  harvest_date: Date | null
}


export type CropRequest = {
  name: string
  variety?: string | null
  quantity?: number | null
  date_planted?: Date | null
  harvest_date?: Date | null
}
