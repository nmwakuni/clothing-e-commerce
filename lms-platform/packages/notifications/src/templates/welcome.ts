export interface WelcomeEmailData {
  userName: string;
  loginUrl: string;
}

export function generateWelcomeEmail(data: WelcomeEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SkillHub Africa</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 40px 20px; border: 1px solid #e5e7eb; }
    .button { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Welcome to SkillHub Africa!</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.userName},</h2>
      <p>Welcome to SkillHub Africa - your journey to mastering new skills starts here!</p>

      <p>We're excited to have you join thousands of learners across Africa who are building their future through our AI-powered learning platform.</p>

      <h3>What's Next?</h3>
      <ul>
        <li>✅ Browse our course catalog</li>
        <li>✅ Start learning via WhatsApp or web</li>
        <li>✅ Get 24/7 support from our AI tutor</li>
        <li>✅ Earn certificates as you complete courses</li>
      </ul>

      <p style="text-align: center;">
        <a href="${data.loginUrl}" class="button">Start Learning Now</a>
      </p>

      <p>If you have any questions, just reply to this email or reach out via WhatsApp.</p>

      <p>Happy learning!<br>The SkillHub Africa Team</p>
    </div>
    <div class="footer">
      <p>Built with ❤️ in Kenya for Africa</p>
      <p>SkillHub Africa | <a href="https://skillhub.co.ke">skillhub.co.ke</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
