import bcrypt from "bcryptjs"


export const generateHash = async (plaintext: string): Promise<string> => {

  let saltRounds = 10

  if (process.env.SALT_ROUNDS) {
    saltRounds = +process.env.SALT_ROUNDS
  }

  return await bcrypt.hash(plaintext, saltRounds)
}


export const compareHash = async (plaintext: string, hash: string): Promise<boolean> => {

  return await bcrypt.compare(plaintext, hash)
}
