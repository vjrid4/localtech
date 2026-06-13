import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET env var must be set and at least 32 characters");
}

export interface ReviewTokenPayload {
  purpose: "review";
  jobId: string;
  reference: string;
  technicianId: string;
}

export function createReviewToken(payload: Omit<ReviewTokenPayload, "purpose">): string {
  return jwt.sign({ ...payload, purpose: "review" }, JWT_SECRET!, { expiresIn: "7d" });
}

export function verifyReviewToken(token: string): ReviewTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as ReviewTokenPayload;
    if (decoded.purpose !== "review") return null;
    return decoded;
  } catch {
    return null;
  }
}

export function reviewLink(token: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://localtech.in";
  return `${base}/review/${token}`;
}
