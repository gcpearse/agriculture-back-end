import { Job } from "../../../../types/job-types";


export const jobData: Job[] = [
  {
    plot_id: 1,
    subdivision_id: 1,
    crop_id: 1,
    issue_id: null,
    title: "Water thyme",
    description: "Example job description.",
    date_added: new Date("2024-07-03"),
    deadline: null,
    is_priority: true,
    is_started: false,
    is_completed: false
  },
  {
    plot_id: 1,
    subdivision_id: null,
    crop_id: null,
    issue_id: null,
    title: "Add plot to database",
    description: "Example job description.",
    date_added: new Date("2024-07-03"),
    deadline: null,
    is_priority: false,
    is_started: true,
    is_completed: true
  }
]
