export interface LessonCompletedEmailData {
  userName: string;
  lessonTitle: string;
  courseName: string;
  nextLessonTitle?: string;
  nextLessonUrl?: string;
  progressPercentage: number;
  xpEarned: number;
}

export function generateLessonCompletedEmail(data: LessonCompletedEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lesson Completed!</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 40px 20px; border: 1px solid #e5e7eb; }
    .stats { display: flex; justify-content: space-around; margin: 20px 0; }
    .stat { text-align: center; }
    .stat-value { font-size: 32px; font-weight: bold; color: #22c55e; }
    .stat-label { color: #6b7280; font-size: 14px; }
    .progress-bar { background: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden; margin: 20px 0; }
    .progress-fill { background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%); height: 100%; transition: width 0.3s; }
    .button { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Lesson Completed!</h1>
    </div>
    <div class="content">
      <h2>Great work, ${data.userName}!</h2>
      <p>You've completed <strong>${data.lessonTitle}</strong> in ${data.courseName}.</p>

      <div class="stats">
        <div class="stat">
          <div class="stat-value">${data.progressPercentage}%</div>
          <div class="stat-label">Course Progress</div>
        </div>
        <div class="stat">
          <div class="stat-value">+${data.xpEarned}</div>
          <div class="stat-label">XP Earned</div>
        </div>
      </div>

      <div class="progress-bar">
        <div class="progress-fill" style="width: ${data.progressPercentage}%"></div>
      </div>

      ${
        data.nextLessonTitle && data.nextLessonUrl
          ? `
      <h3>Up Next</h3>
      <p>${data.nextLessonTitle}</p>
      <p style="text-align: center;">
        <a href="${data.nextLessonUrl}" class="button">Continue Learning</a>
      </p>
      `
          : `
      <p>🎉 Congratulations! You've completed all lessons in this course.</p>
      `
      }

      <p>Keep up the great work!</p>

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
