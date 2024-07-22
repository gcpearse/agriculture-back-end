import { Issue } from "../../../../types/issue-types";


export const issueData: Issue[] = [
  {
    plot_id: 1,
    subdivision_id: 1,
    title: "Example Issue",
    description: "This is an unresolved issue",
    is_resolved: false
  },
  {
    plot_id: 1,
    subdivision_id: null,
    title: "Example Issue",
    description: "This is a resolved issue",
    is_resolved: true
  }
]
