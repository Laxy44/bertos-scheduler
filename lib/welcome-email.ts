import "server-only";

import { getSiteUrl } from "./site-url";

type SendWelcomeEmailParams = {
  to: string;
  firstName?: string | null;
};

function welcomeHtml(params: { firstName: string; dashboardUrl: string }) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
      <h2 style="margin: 0 0 12px;">Welcome to Planyo 🚀</h2>
      <p style="margin: 0 0 12px;">Hi ${params.firstName},</p>
      <p style="margin: 0 0 12px;">
        Your workspace is ready. You can now start building your team schedule in Planyo.
      </p>
      <p style="margin: 0 0 8px; font-weight: 600;">Next steps:</p>
      <ul style="margin: 0 0 20px 20px; padding: 0;">
        <li>Add employees to your workspace</li>
        <li>Create your first schedule</li>
      </ul>
      <a
        href="${params.dashboardUrl}"
        style="display: inline-block; padding: 10px 16px; border-radius: 8px; text-decoration: none; background: #0f172a; color: #ffffff; font-weight: 600;"
      >
        Open Planyo
      </a>
    </div>
  `;
}

export async function sendWelcomeEmail({ to, firstName }: SendWelcomeEmailParams) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "Planyo <noreply@planyo.app>";
  const siteUrl = getSiteUrl();
  const dashboardUrl = `${siteUrl}/`;
  const safeFirstName = (firstName || "there").trim() || "there";

  if (!resendApiKey) {
    console.warn("[welcome-email] RESEND_API_KEY is missing; skipping email send.");
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
      subject: "Welcome to Planyo 🚀",
      html: welcomeHtml({ firstName: safeFirstName, dashboardUrl }),
      text: [
        "Welcome to Planyo 🚀",
        "",
        `Hi ${safeFirstName},`,
        "",
        "Your workspace is ready.",
        "Next steps:",
        "- Add employees",
        "- Create your first schedule",
        "",
        `Open Planyo: ${dashboardUrl}`,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend API error (${response.status}): ${errorBody}`);
  }
}
