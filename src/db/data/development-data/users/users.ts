import { UnitSystem, User } from "../../../../types/user-types";


export const userData: User[] = [
  {
    username: "admin",
    password: process.env.ADMIN_PASSWORD!,
    email: "admin",
    first_name: "Admin",
    surname: "Admin",
    unit_preference: UnitSystem.Metric,
    token: null,
    token_expiry: null
  }
]
