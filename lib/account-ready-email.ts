import "server-only";

import { getSiteUrl } from "./site-url";

type SendAccountReadyEmailParams = {
  to: string;
};

function accountReadyHtml(loginUrl: string) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
      <h2 style="margin: 0 0 12px;">Your account is ready</h2>
      <p style="margin: 0 0 12px;">
        Your Planyo account has been activated. You can now sign in using this email address.
      </p>
      <p style="margin: 0 0 20px;">
        Your email is now your username for future logins.
      </p>
      <a
        href="${loginUrl}"
        style="display: inline-block; padding: 10px 16px; border-radius: 8px; text-decoration: none; background: #0f172a; color: #ffffff; font-weight: 600;"
      >
        Go to login
      </a>
    </div>
  `;
}

export async function sendAccountReadyEmail({ to }: SendAccountReadyEmailParams) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "Planyo <noreply@planyo.app>";
  const siteUrl = getSiteUrl();
  const loginUrl = `${siteUrl}/login`;

  if (!resendApiKey) {
    console.warn("[account-ready-email] RESEND_API_KEY is missing; skipping email send.");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Your Planyo account is ready",
      html: accountReadyHtml(loginUrl),
      text: [
        "Your account is ready",
        "",
        "Your Planyo account has been activated. You can now sign in using this email address.",
        "Your email is now your username for future logins.",
        "",
        `Go to login: ${loginUrl}`,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend API error (${response.status}): ${errorBody}`);
  }
}
