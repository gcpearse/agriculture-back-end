import { seed } from "./seed"
// Change to development data later
import data from "../data/test-data/index"
import { db } from ".."


const runSeed = async () => {

  await seed(data)

  return await db.end()
}


runSeed()
