export type Crop = {
  crop_id?: number
  plot_id: number
  subdivision_id: number | null
  name: string
  variety: string | null
  category: string
  quantity: number | null
  date_planted: Date | null
  harvest_date: Date | null
}


export type ExtendedCrop = {
  plot_name?: string
  subdivision_name?: string
  note_count: number
  image_count: number
} & Crop


export type CropRequest = {
  name: string
  variety?: string | null
  category: string
  quantity?: number | null
  date_planted?: Date | null
  harvest_date?: Date | null
}
