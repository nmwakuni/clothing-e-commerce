export interface CourseEnrollmentEmailData {
  userName: string;
  courseName: string;
  courseUrl: string;
  instructorName: string;
  totalLessons: number;
  estimatedHours: string;
}

export function generateCourseEnrollmentEmail(data: CourseEnrollmentEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Course Enrollment Confirmation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 40px 20px; border: 1px solid #e5e7eb; }
    .course-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .button { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 You're Enrolled!</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.userName},</h2>
      <p>Congratulations! You've successfully enrolled in:</p>

      <div class="course-info">
        <h3>${data.courseName}</h3>
        <p><strong>Instructor:</strong> ${data.instructorName}</p>
        <p><strong>Lessons:</strong> ${data.totalLessons} lessons</p>
        <p><strong>Duration:</strong> ${data.estimatedHours} hours</p>
      </div>

      <h3>How to Get Started</h3>
      <ol>
        <li>Access your course anytime via web or WhatsApp</li>
        <li>Complete lessons at your own pace</li>
        <li>Ask our AI tutor if you get stuck</li>
        <li>Earn your certificate upon completion</li>
      </ol>

      <p style="text-align: center;">
        <a href="${data.courseUrl}" class="button">Start Learning</a>
      </p>

      <p>We're here to support you every step of the way. Happy learning!</p>

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
