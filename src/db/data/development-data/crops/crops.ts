import { Crop } from "../../../../types/crop-types";


export const cropData: Crop[] = [
  {
    plot_id: 1,
    subdivision_id: 1,
    name: "Thyme",
    variety: null,
    quantity: null,
    date_planted: null,
    harvest_date: null
  },
  {
    plot_id: 1,
    subdivision_id: 2,
    name: "Potato",
    variety: "Maris Piper",
    quantity: 10,
    date_planted: new Date("2024-07-01"),
    harvest_date: new Date("2034-07-01")
  },
  {
    plot_id: 1,
    subdivision_id: 2,
    name: "Cabbage",
    variety: "Savoy",
    quantity: 20,
    date_planted: new Date("2024-06-01"),
    harvest_date: new Date("2025-06-01")
  }
]
