import dotenv from "dotenv"
import { Pool } from "pg"

const ENV = process.env.NODE_ENV || "development"

dotenv.config({
  path: `${__dirname}/../../.env.${ENV}`
})

if (!process.env.PGDATABASE) {
  throw new Error("PGDATABASE not set")
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET not set")
}

export const db = new Pool()
