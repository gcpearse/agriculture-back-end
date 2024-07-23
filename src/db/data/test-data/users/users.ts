import { UnitSystem, User } from "../../../../types/user-types";


export const userData: User[] = [
  {
    username: "carrot_king",
    password: "carrots123",
    email: "john.smith@example.com",
    first_name: "John",
    surname: "Smith",
    unit_preference: UnitSystem.Imperial,
    token: null,
    token_expiry: null
  },
  {
    username: "peach_princess",
    password: "peaches123",
    email: "olivia.jones@example.com",
    first_name: "Olivia",
    surname: "Jones",
    unit_preference: UnitSystem.Metric,
    token: null,
    token_expiry: null
  },
  {
    username: "quince_queen",
    password: "quince123",
    email: "maria.perez@example.com",
    first_name: "Maria",
    surname: "Perez",
    unit_preference: UnitSystem.Metric,
    token: null,
    token_expiry: null
  }
]
