import { Crop } from "../../../../types/crop-types";


export default [
  {
    plot_id: 1,
    subdivision_id: 1,
    name: "carrot",
    variety: null,
    quantity: 20,
    date_planted: new Date("2024-06-20"),
    harvest_date: new Date("2024-09-15")
  },
  {
    plot_id: 1,
    subdivision_id: null,
    name: "apple",
    variety: "lord derby",
    quantity: 1,
    date_planted: new Date("2023-09-21"),
    harvest_date: new Date("2024-09-21")
  },
  {
    plot_id: 2,
    subdivision_id: null,
    name: "peach",
    variety: null,
    quantity: 2,
    date_planted: new Date("2020-06-30"),
    harvest_date: new Date("2024-07-25")
  },
  {
    plot_id: 2,
    subdivision_id: null,
    name: "blackcurrant",
    variety: null,
    quantity: null,
    date_planted: new Date("2022-08-30"),
    harvest_date: new Date("2024-07-14")
  }
] as Crop[]
