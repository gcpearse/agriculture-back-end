export type Job = {
  job_id?: number
  plot_id: number
  crop_id: number | null
  issue_id: number | null
  title: string
  description: string
  date_added: Date
  deadline: Date | null
  is_started: boolean
  is_completed: boolean
}
