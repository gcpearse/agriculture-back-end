import { Crop } from "../../../../types/crop-types";


export const cropData: Crop[] = [
  {
    plot_id: 1,
    subdivision_id: 1,
    name: "Carrot",
    variety: null,
    quantity: 20,
    date_planted: new Date("2024-06-20"),
    harvest_date: new Date("2024-09-15")
  },
  {
    plot_id: 1,
    subdivision_id: null,
    name: "Apple",
    variety: "Lord Derby",
    quantity: 1,
    date_planted: new Date("2023-09-21"),
    harvest_date: new Date("2024-09-21")
  },
  {
    plot_id: 1,
    subdivision_id: null,
    name: "Cabbage",
    variety: null,
    quantity: null,
    date_planted:  null,
    harvest_date: null
  },
  {
    plot_id: 1,
    subdivision_id: 1,
    name: "Pecan",
    variety: null,
    quantity: 1,
    date_planted: new Date("2024-07-19"),
    harvest_date: new Date("2026-07-19")
  },
  {
    plot_id: 2,
    subdivision_id: null,
    name: "Peach",
    variety: null,
    quantity: 2,
    date_planted: new Date("2020-06-30"),
    harvest_date: new Date("2024-07-25")
  },
  {
    plot_id: 2,
    subdivision_id: null,
    name: "Blackcurrant",
    variety: null,
    quantity: null,
    date_planted: new Date("2022-08-30"),
    harvest_date: new Date("2024-07-14")
  }
]
