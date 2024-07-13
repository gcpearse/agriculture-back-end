import jwt from "jsonwebtoken"


export const generateToken = (username: { username: string }) => {

  return jwt.sign(username, process.env.JWT_SECRET!, { expiresIn: 3600 })
}
