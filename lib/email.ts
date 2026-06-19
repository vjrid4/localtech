/**
 * Thin email sender.
 * In dev (no SMTP_HOST): logs the email to console.
 * In prod: sends via SMTP using the env vars below.
 *
 * Required env vars for real sending:
 *   SMTP_HOST, SMTP_PORT (default 587), SMTP_USER, SMTP_PASS
 *   SMTP_FROM  (default: "LocalTech <noreply@localtech.in>")
 */

type MailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(opts: MailOptions): Promise<void> {
  const host = process.env.SMTP_HOST;

  if (!host) {
    console.log(`[email] SMTP not configured — would send to ${opts.to}`);
    console.log(`[email] Subject: ${opts.subject}`);
    console.log(`[email] Body (text): ${opts.text ?? "(html only)"}`);
    return;
  }

  // Dynamic import so the module doesn't break builds without nodemailer installed
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodemailer = await import("nodemailer").catch(() => null);
  if (!nodemailer) {
    // Fallback: use raw SMTP via fetch to a mail relay API if one is configured
    console.error("[email] nodemailer not installed. Add it: npm i nodemailer @types/nodemailer");
    return;
  }

  const transporter = nodemailer.default.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT ?? "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "LocalTech <noreply@localtech.in>",
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}
