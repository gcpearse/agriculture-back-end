import { Plot } from "../../../../types/plot-types";


export const plotData: Plot[] = [
  {
    owner_id: 1,
    name: "John's Garden",
    type: "Garden",
    description: "A vegetable garden",
    location: "Farmville",
    area: 100,
    is_pinned: true
  },
  {
    owner_id: 2,
    name: "Olivia's Field",
    type: "Field",
    description: "An orchard",
    location: "Lemongrove",
    area: 500,
    is_pinned: false
  },
  {
    owner_id: 1,
    name: "John's Allotment",
    type: "Allotment",
    description: "An allotment",
    location: "Farmville",
    area: 50,
    is_pinned: true
  },
  {
    owner_id: 1,
    name: "John's New Allotment",
    type: "Allotment",
    description: "A second allotment",
    location: "Farmville",
    area: 40,
    is_pinned: false
  }
]
