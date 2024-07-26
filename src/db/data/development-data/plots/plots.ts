import { Plot } from "../../../../types/plot-types";


export const plotData: Plot[] = [
  {
    owner_id: 1,
    name: "Admin's Field",
    type: "Field",
    description: "The admin's field",
    location: "Example location",
    area: 100,
    is_pinned: true
  },
  {
    owner_id: 1,
    name: "Admin's Allotment",
    type: "Allotment",
    description: "The admin's allotment",
    location: "Example location",
    area: null,
    is_pinned: false
  }
]
