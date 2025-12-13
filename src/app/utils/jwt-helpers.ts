import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { User } from "../../../prisma/generated";

export const tokenGenerator = (
  payload: Record<string, unknown>,
  secret: Secret,
  expiresIn: string | number
) => {
  const token = jwt.sign(payload, secret, { expiresIn } as SignOptions);
  return token;
};

export const tokenVerifier = (token: string, secret: Secret) => {
  return jwt.verify(token, secret);
};

export const payloadMaker = (user: User) => ({
  id: user.id,
  name: user.name,
  avatar: user.avatar,
  contact_number: user.contact_number,
  email: user.email,
  role: user.role,
  company_id: user.company_id,
})
