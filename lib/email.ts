/**
 * Thin email sender.
 *
 * Currently logs to console (no SMTP configured).
 * To enable real sending:
 *   1. npm i nodemailer @types/nodemailer
 *   2. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM in .env
 *   3. Uncomment the nodemailer block below.
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
    console.log(`[email] to=${opts.to} subject="${opts.subject}"`);
    if (opts.text) console.log(`[email] ${opts.text}`);
    return;
  }

  /*
   * Uncomment after: npm i nodemailer @types/nodemailer
   *
   * const nodemailer = await import("nodemailer");
   * const t = nodemailer.default.createTransport({
   *   host,
   *   port: parseInt(process.env.SMTP_PORT ?? "587", 10),
   *   secure: process.env.SMTP_SECURE === "true",
   *   auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
   * });
   * await t.sendMail({
   *   from: process.env.SMTP_FROM ?? "LocalTech <noreply@localtech.in>",
   *   to: opts.to, subject: opts.subject, html: opts.html, text: opts.text,
   * });
   */

  console.warn("[email] SMTP_HOST set but nodemailer not installed — email not sent");
}
