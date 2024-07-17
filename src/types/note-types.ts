type Note = {
  note_id?: number
  body: string
  created_at: string
}


export type CropNote = {
  crop_id: number
} & Note


export type IssueNote = {
  issue_id: number
} & Note
