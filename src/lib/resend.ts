export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  
  // Resend sender email (defaults to support@medicintime.com)
  const from = process.env.RESEND_FROM_EMAIL || "MedicINtime Support <support@medicintime.com>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Resend Email API Error:", data);
    throw new Error(data?.message || "Failed to send email via Resend");
  }

  return data;
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 40px 20px; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background-color: #0D3D56; padding: 32px 24px; text-align: center; }
          .logo { max-height: 48px; width: auto; }
          .content { padding: 36px 32px; }
          .h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
          .p { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { display: inline-block; background-color: #0D3D56; color: #ffffff !important; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 6px rgba(13,61,86,0.2); }
          .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
          .link-fallback { font-size: 12px; color: #94a3b8; word-break: break-all; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://medicintime.com/official-logo.png" alt="MedicINtime" class="logo" />
          </div>
          <div class="content">
            <h1 class="h1">Reset Your Password</h1>
            <p class="p">Hi ${name || 'there'},</p>
            <p class="p">We received a request to reset the password for your MedicINtime account (${to}). Click the button below to set a new password:</p>
            <div class="btn-container">
              <a href="${resetUrl}" target="_blank" class="btn">Reset Password</a>
            </div>
            <p class="p">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            <div class="link-fallback">
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <a href="${resetUrl}" style="color: #0D3D56;">${resetUrl}</a>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} MedicINtime. All rights reserved.<br>
            Smart Automated Medication & Pill Reminders
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: "Reset your MedicINtime password",
    html,
  });
}
