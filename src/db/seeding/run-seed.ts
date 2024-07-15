import { seed } from "./seed"
// Change to development data later
import data from "../data/test-data/data-index"
import { db } from ".."


const runSeed = async (): Promise<void> => {

  await seed(data)

  return await db.end()
}


runSeed()
