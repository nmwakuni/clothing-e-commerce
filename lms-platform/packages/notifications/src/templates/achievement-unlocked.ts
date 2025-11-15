export interface AchievementUnlockedEmailData {
  userName: string;
  achievementTitle: string;
  achievementDescription: string;
  achievementIcon: string;
  dashboardUrl: string;
}

export function generateAchievementUnlockedEmail(data: AchievementUnlockedEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Achievement Unlocked!</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 40px 20px; border: 1px solid #e5e7eb; }
    .achievement { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0; border: 2px solid #fbbf24; }
    .achievement-icon { font-size: 64px; margin-bottom: 10px; }
    .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏆 Achievement Unlocked!</h1>
    </div>
    <div class="content">
      <h2>Congratulations, ${data.userName}!</h2>
      <p>You've unlocked a new achievement:</p>

      <div class="achievement">
        <div class="achievement-icon">${data.achievementIcon}</div>
        <h3>${data.achievementTitle}</h3>
        <p>${data.achievementDescription}</p>
      </div>

      <p>Your dedication to learning is truly impressive. Keep up the amazing work!</p>

      <p style="text-align: center;">
        <a href="${data.dashboardUrl}" class="button">View All Achievements</a>
      </p>

      <p>Keep pushing forward. You're doing great!</p>

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
