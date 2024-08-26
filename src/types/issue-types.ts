export type Issue = {
  issue_id?: number
  plot_id: number
  subdivision_id: number | null
  title: string
  description: string
  is_critical: boolean
  is_resolved: boolean
}
