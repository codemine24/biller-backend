import jwt, { SignOptions, Secret } from "jsonwebtoken";

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
