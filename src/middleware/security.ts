import bcrypt from "bcryptjs"


export const hashPassword = async (password: string) => {

  let saltRounds = 10

  if (process.env.SALT_ROUNDS) {
    saltRounds = +process.env.SALT_ROUNDS
  }

  return await bcrypt.hash(password, saltRounds)
}


export const comparePasswords = async (password: string, hashedPassword: string) => {

  return await bcrypt.compare(password, hashedPassword)
}
