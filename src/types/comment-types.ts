type Comment = {
  comment_id?: number
  body: string
  created_at: string
}


export type CropComment = {
  crop_id: number
} & Comment


export type IssueComment = {
  issue_id: number
} & Comment
