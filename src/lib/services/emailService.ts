import { Resend } from 'resend';

// Load Resend API Key from environment variables safely
const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface SendEmailPayload {
  from?: string;
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email using the Resend API with standard configuration.
 * Gracefully logs warning and returns null if RESEND_API_KEY is not defined.
 */
export async function sendEmail({
  from = 'onboarding@resend.dev',
  to,
  subject,
  html
}: SendEmailPayload) {
  if (!resend) {
    console.warn("[Resend Email Service] RESEND_API_KEY is not defined in the environment. Skipping email dispatch.");
    return null;
  }

  try {
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    return data;
  } catch (error) {
    console.error("[Resend Email Service] Failed to send email:", error);
    throw error;
  }
}
