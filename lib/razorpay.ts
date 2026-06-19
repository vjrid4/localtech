import { createHmac, timingSafeEqual } from "crypto";

const KEY_ID     = process.env.RAZORPAY_KEY_ID     ?? "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET  ?? "";
const BASE       = "https://api.razorpay.com/v1";

function authHeader() {
  return "Basic " + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");
}

export type RazorpayLinkResult = {
  id: string;
  short_url: string;
  expire_by: number; // unix seconds
};

export async function createPaymentLink(opts: {
  amountPaise: number;
  description: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  referenceId: string;
  callbackUrl: string;
}): Promise<RazorpayLinkResult> {
  if (!KEY_ID || !KEY_SECRET) {
    // Mock in dev
    console.warn("[razorpay] RAZORPAY_KEY_ID/SECRET not set — returning mock payment link");
    return {
      id: `mock_${opts.referenceId}`,
      short_url: `https://rzp.io/mock/${opts.referenceId}`,
      expire_by: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
    };
  }

  const expireBy = Math.floor(Date.now() / 1000) + 7 * 24 * 3600; // 7 days
  const res = await fetch(`${BASE}/payment_links`, {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: opts.amountPaise,
      currency: "INR",
      description: opts.description,
      reference_id: opts.referenceId,
      customer: {
        name: opts.customerName,
        contact: `+91${opts.customerPhone.replace(/\D/g, "").slice(-10)}`,
        ...(opts.customerEmail ? { email: opts.customerEmail } : {}),
      },
      callback_url: opts.callbackUrl,
      callback_method: "get",
      expire_by: expireBy,
      reminder_enable: true,
      notify: { sms: true, email: !!opts.customerEmail },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Razorpay error ${res.status}: ${JSON.stringify(err)}`);
  }
  return res.json() as Promise<RazorpayLinkResult>;
}

export function verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  if (signature.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
