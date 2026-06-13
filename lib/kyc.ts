/**
 * KYC provider integration — Surepass (primary).
 *
 * Set KYC_API_TOKEN in .env.local to enable real verification.
 * Without it every call returns a clearly-labelled mock response so the
 * full UI flow can be tested in dev without spending ₹ per call.
 *
 * SECURITY: Aadhaar numbers are NEVER stored or logged in plaintext.
 * Only masked form (XXXX-XXXX-1234) is persisted.
 */

const BASE = "https://kyc-api.surepass.io/api/v1";
const TOKEN = process.env.KYC_API_TOKEN;
const IS_MOCK = !TOKEN;

const MOCK_DELAY = () => new Promise((r) => setTimeout(r, 1200));

// ── Fuzzy name match (Aadhaar name vs PAN name) ───────────────────────────

function normalise(s: string) {
  return s.toUpperCase().replace(/[^A-Z ]/g, "").trim().replace(/\s+/g, " ");
}

function editDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

export function nameSimilarity(a: string, b: string): number {
  const na = normalise(a), nb = normalise(b);
  if (na === nb) return 1;
  const maxLen = Math.max(na.length, nb.length);
  if (maxLen === 0) return 1;
  return 1 - editDistance(na, nb) / maxLen;
}

// ── Aadhaar OKYC ──────────────────────────────────────────────────────────

export async function initiateAadhaarOTP(aadhaarNumber: string): Promise<{ clientId: string }> {
  if (IS_MOCK) {
    await MOCK_DELAY();
    return { clientId: `mock_${Date.now()}` };
  }
  const res = await fetch(`${BASE}/aadhaar-v2/generate-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ id_number: aadhaarNumber }),
  });
  const data = await res.json();
  if (!res.ok || !data.data?.client_id) throw new Error(data.message ?? "OTP request failed");
  return { clientId: data.data.client_id };
}

export interface AadhaarData {
  name: string;        // full name from Aadhaar
  dob: string;         // YYYY-MM-DD
  maskedAadhaar: string; // XXXX-XXXX-1234
  photo: string | null;  // base64 (from provider) — use as profile photo, do not store
}

export async function verifyAadhaarOTP(clientId: string, otp: string): Promise<AadhaarData> {
  if (IS_MOCK) {
    await MOCK_DELAY();
    if (otp === "000000") throw new Error("Invalid OTP — please check and try again");
    return {
      name: "DEMO TECHNICIAN",
      dob: "1995-06-15",
      maskedAadhaar: "XXXX-XXXX-5678",
      photo: null,
    };
  }
  const res = await fetch(`${BASE}/aadhaar-v2/submit-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ client_id: clientId, otp }),
  });
  const data = await res.json();
  if (!res.ok || !data.data) throw new Error(data.message ?? "OTP verification failed");
  const d = data.data;
  const last4 = String(d.aadhaar_number ?? "").slice(-4) || "XXXX";
  return {
    name: d.full_name ?? d.name ?? "",
    dob: d.dob ?? "",
    maskedAadhaar: `XXXX-XXXX-${last4}`,
    photo: d.photo ?? null,
  };
}

// ── PAN verification ───────────────────────────────────────────────────────

export interface PANData {
  name: string;
  panNumber: string; // uppercase, stored as-is (PAN is not sensitive like Aadhaar)
}

export async function verifyPAN(panNumber: string): Promise<PANData> {
  if (IS_MOCK) {
    await MOCK_DELAY();
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panNumber.toUpperCase())) {
      throw new Error("Invalid PAN format");
    }
    return { name: "DEMO TECHNICIAN", panNumber: panNumber.toUpperCase() };
  }
  const res = await fetch(`${BASE}/pan`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ id_number: panNumber.toUpperCase() }),
  });
  const data = await res.json();
  if (!res.ok || !data.data) throw new Error(data.message ?? "PAN verification failed");
  return {
    name: data.data.name ?? data.data.full_name ?? "",
    panNumber: panNumber.toUpperCase(),
  };
}

// ── Face match ─────────────────────────────────────────────────────────────

export interface FaceMatchResult {
  confidence: number; // 0–1
  isMatch: boolean;   // confidence >= 0.75
}

/**
 * @param aadhaarBase64 - photo from Aadhaar OTP response
 * @param selfieBase64  - photo uploaded by technician
 */
export async function faceMatch(
  aadhaarBase64: string,
  selfieBase64: string
): Promise<FaceMatchResult> {
  if (IS_MOCK) {
    await MOCK_DELAY();
    // Mock: always pass with 0.88 — real failures will only appear with live API
    return { confidence: 0.88, isMatch: true };
  }
  const res = await fetch(`${BASE}/face-match`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ file: aadhaarBase64, file2: selfieBase64 }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Face match failed");
  const confidence = data.data?.confidence ?? 0;
  return { confidence, isMatch: confidence >= 0.75 };
}
