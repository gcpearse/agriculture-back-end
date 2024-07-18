import { seed } from "./seed"
import data from "../data/development-data/development-index"
import { db } from ".."


const runSeed = async (): Promise<void> => {

  await seed(data)

  return await db.end()
}


runSeed()
