import jwt from "jsonwebtoken";

// SECURITY: No fallback — JWT_SECRET must be set in the environment.
// In dev, add JWT_SECRET to .env.local. In prod, use your secrets manager.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET env var must be set and at least 32 characters");
}

export interface TokenPayload {
  userId: string;
  email: string;
  userType: string;
  tokenVersion?: number;
}

export function createToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.decode(token) as TokenPayload | null;
    return decoded;
  } catch {
    return null;
  }
}
