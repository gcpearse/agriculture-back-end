export type Issue = {
  issue_id?: number
  plot_id: number
  subdivision_id: number | null
  title: string
  description: string
  is_critical: boolean
  is_resolved: boolean
}


export type ExtendedIssue = {
  plot_name?: string
  subdivision_name?: string | null
  note_count: number
  image_count: number
} & Issue


export type IssueRequest = {
  title: string
  description: string
  is_critical?: boolean
}
