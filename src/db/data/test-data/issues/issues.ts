import { Issue } from "../../../../types/issue-types";


export const issueData: Issue[] = [
  {
    plot_id: 1,
    subdivision_id: null,
    title: "Broken gate",
    description: "The gate has fallen off its hinges",
    is_resolved: false
  },
  {
    plot_id: 1,
    subdivision_id: null,
    title: "Weeds",
    description: "The garden has become infested with weeds",
    is_resolved: true
  },
  {
    plot_id: 1,
    subdivision_id: 1,
    title: "Slug infestation",
    description: "Slugs are destroying the carrots",
    is_resolved: false
  },
  {
    plot_id: 2,
    subdivision_id: null,
    title: "Rotten fence posts",
    description: "Some of the fence posts are rotting and need replacing",
    is_resolved: false
  }
]
