import { Job } from "../../../../types/job-types";


export default [
  {
    plot_id: 1,
    subdivision_id: null,
    crop_id: null,
    issue_id: null,
    title: "Rhubarb?",
    description: "Thinking about planting rhubarb.",
    date_added: new Date("2024-07-12"),
    deadline: null,
    is_started: false,
    is_completed: false
  },
  {
    plot_id: 1,
    subdivision_id: 1,
    crop_id: 1,
    issue_id: null,
    title: "Compost for carrots",
    description: "The carrots need compost.",
    date_added: new Date("2024-06-22"),
    deadline: new Date("2024-07-30"),
    is_started: false,
    is_completed: false
  },
  {
    plot_id: 2,
    subdivision_id: null,
    crop_id: null,
    issue_id: 3,
    title: "Remove rotten posts",
    description: "The rotten posts need to be removed first.",
    date_added: new Date("2024-07-12"),
    deadline: new Date("2024-08-01"),
    is_started: true,
    is_completed: false
  },
  {
    plot_id: 2,
    subdivision_id: null,
    crop_id: 4,
    issue_id: null,
    title: "Water the blackcurrants",
    description: "Each plant will need a full watering can.",
    date_added: new Date("2024-07-01"),
    deadline: null,
    is_started: true,
    is_completed: true
  },
] as Job[]
