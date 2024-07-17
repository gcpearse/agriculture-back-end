export type Job = {
  job_id?: number
  plot_id: number
  subdivision_id: number | null
  crop_id: number | null
  issue_id: number | null
  title: string
  description: string
  date_added: Date
  deadline: Date | null
  is_started: boolean
  is_completed: boolean
}
