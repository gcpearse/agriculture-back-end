export enum PlotType {
  Allotment = "allotment",
  Field = "field",
  Flowerbed = "flowerbed",
  Garden = "garden",
  HerbGarden = "herb garden",
  Homestead = "homestead",
  Orchard = "orchard",
  VegetablePatch = "vegetable patch"
}


export type Plot = {
  plot_id?: number
  owner_id: number
  name: string
  type: PlotType
  description: string
  location: string
  area: number | null
}
