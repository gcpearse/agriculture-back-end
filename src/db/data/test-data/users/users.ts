import { UnitSystem, User, UserRole } from "../../../../types/user-types";


export const userData: User[] = [
  {
    username: "carrot_king",
    password: "Carrots123",
    email: "john.smith@example.com",
    first_name: "John",
    surname: "Smith",
    role: UserRole.Admin,
    unit_system: UnitSystem.Imperial,
    token: null,
    token_expiry: null
  },
  {
    username: "peach_princess",
    password: "Peaches123",
    email: "olivia.jones@example.com",
    first_name: "Olivia",
    surname: "Jones",
    role: UserRole.User,
    unit_system: UnitSystem.Metric,
    token: null,
    token_expiry: null
  },
  {
    username: "quince_queen",
    password: "Quince123",
    email: "maria.perez@example.com",
    first_name: "Maria",
    surname: "Perez",
    role: UserRole.User,
    unit_system: UnitSystem.Metric,
    token: null,
    token_expiry: null
  }
]
