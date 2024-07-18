import { UnitSystem, User } from "../../../../types/user-types";


export const userData: User[] = [
  {
    username: "admin",
    password: process.env.ADMIN_PASSWORD!,
    email: "example",
    first_name: "admin_first_name",
    surname: "admin_surname",
    unit_preference: UnitSystem.Metric
  }
]
