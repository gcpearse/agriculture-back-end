import { Crop } from "./crop-types"
import { CropImage, IssueImage, JobImage, PlotImage, SubdivisionImage } from "./image-types"
import { Issue } from "./issue-types"
import { Job } from "./job-types"
import { CropNote, IssueNote } from "./note-types"
import { Plot } from "./plot-types"
import { Subdivision } from "./subdivision-types"
import { User } from "./user-types"


export type SeedData = {
  userData: User[]
  plotData: Plot[]
  plotImageData: PlotImage[]
  plotTypeData: { type: string }[]
  subdivisionData: Subdivision[]
  subdivisionImageData: SubdivisionImage[]
  subdivisionTypeData: { type: string }[]
  cropData: Crop[]
  cropNoteData: CropNote[]
  cropImageData: CropImage[]
  cropCategoryData: { category: string }[]
  issueData: Issue[]
  issueNoteData: IssueNote[]
  issueImageData: IssueImage[]
  jobData: Job[]
  jobImageData: JobImage[]
}
