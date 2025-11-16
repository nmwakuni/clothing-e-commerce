export interface PasswordResetEmailData {
  userName: string;
  resetUrl: string;
  expiryMinutes: number;
}

export function generatePasswordResetEmail(data: PasswordResetEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 40px 20px; border: 1px solid #e5e7eb; }
    .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 Password Reset Request</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.userName},</h2>
      <p>We received a request to reset your password for your SkillHub Africa account.</p>

      <p style="text-align: center;">
        <a href="${data.resetUrl}" class="button">Reset Password</a>
      </p>

      <p>This link will expire in <strong>${data.expiryMinutes} minutes</strong>.</p>

      <div class="warning">
        <strong>⚠️ Important:</strong> If you didn't request this password reset, please ignore this email and ensure your account is secure.
      </div>

      <p>For security reasons, this link can only be used once.</p>

      <p>If you're having trouble with the button above, copy and paste this URL into your browser:</p>
      <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${data.resetUrl}</p>

      <p>Best regards,<br>The SkillHub Africa Team</p>
    </div>
    <div class="footer">
      <p>SkillHub Africa | <a href="https://skillhub.co.ke">skillhub.co.ke</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
