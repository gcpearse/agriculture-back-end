import data from "../db/data/test-data/index"
import { db } from "../db"
import { seed } from "../db/seeding/seed"


beforeEach(() => seed(data))
afterAll(() => db.end())
