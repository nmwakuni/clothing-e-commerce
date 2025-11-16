/**
 * Pre-built message templates for learning scenarios
 */

import type { WhatsAppService } from '../index';

/**
 * Welcome message when user first interacts
 */
export async function sendWelcomeMessage(
  whatsapp: WhatsAppService,
  phoneNumber: string,
  userName?: string
) {
  const greeting = userName ? `Hi ${userName}!` : 'Hi there!';

  return whatsapp.sendButtons(
    phoneNumber,
    `${greeting} 👋

Welcome to SkillHub Africa! 🎓

I'm your AI learning assistant. I can help you:
✅ Learn new skills (coding, design, business)
✅ Answer questions 24/7
✅ Track your progress
✅ Get certified

What would you like to do?`,
    [
      { id: 'browse_courses', title: 'Browse Courses' },
      { id: 'continue_learning', title: 'Continue Learning' },
      { id: 'get_help', title: 'Get Help' },
    ],
    {
      header: 'Welcome to SkillHub!',
      footer: 'Reply anytime to get started',
    }
  );
}

/**
 * Course catalog message
 */
export async function sendCourseCatalog(whatsapp: WhatsAppService, phoneNumber: string) {
  return whatsapp.sendList(
    phoneNumber,
    `Here are our most popular courses 📚

Each course includes:
• Interactive lessons
• Hands-on projects
• AI tutor support
• Verified certificate`,
    'View Courses',
    [
      {
        title: 'Programming',
        rows: [
          {
            id: 'course_web_dev',
            title: 'Web Development',
            description: 'HTML, CSS, JavaScript • 6 weeks',
          },
          {
            id: 'course_python',
            title: 'Python Basics',
            description: 'Learn Python from scratch • 4 weeks',
          },
        ],
      },
      {
        title: 'Business',
        rows: [
          {
            id: 'course_digital_marketing',
            title: 'Digital Marketing',
            description: 'Social media, SEO, ads • 5 weeks',
          },
          {
            id: 'course_excel',
            title: 'Excel Mastery',
            description: 'Formulas, pivot tables, automation • 3 weeks',
          },
        ],
      },
    ],
    {
      header: 'Course Catalog',
      footer: 'KES 2,000 or KES 500/month with Premium',
    }
  );
}

/**
 * Lesson progress message
 */
export async function sendLessonProgress(
  whatsapp: WhatsAppService,
  phoneNumber: string,
  lessonTitle: string,
  progress: number
) {
  const progressBar =
    '▓'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));

  return whatsapp.sendText(
    phoneNumber,
    `📊 Lesson Progress

${lessonTitle}

${progressBar} ${progress}%

${progress < 100 ? "Keep going! You're doing great! 💪" : '🎉 Lesson completed! Ready for the next one?'}`
  );
}

/**
 * Daily learning reminder
 */
export async function sendDailyReminder(
  whatsapp: WhatsAppService,
  phoneNumber: string,
  streakDays: number
) {
  return whatsapp.sendButtons(
    phoneNumber,
    `Good morning! ☀️

${streakDays > 0 ? `🔥 You're on a ${streakDays}-day streak!` : 'Start learning today!'}

Ready to continue your learning journey?`,
    [
      { id: 'continue_lesson', title: 'Continue Lesson' },
      { id: 'start_practice', title: 'Practice' },
      { id: 'later', title: 'Remind Me Later' },
    ],
    {
      footer: 'Daily learning = faster progress',
    }
  );
}

/**
 * Achievement unlocked message
 */
export async function sendAchievement(
  whatsapp: WhatsAppService,
  phoneNumber: string,
  achievement: {
    title: string;
    description: string;
    icon: string;
  }
) {
  return whatsapp.sendText(
    phoneNumber,
    `🏆 Achievement Unlocked!

${achievement.icon} ${achievement.title}

${achievement.description}

Keep up the great work! 🎉`
  );
}

/**
 * Quiz result message
 */
export async function sendQuizResult(
  whatsapp: WhatsAppService,
  phoneNumber: string,
  score: number,
  totalQuestions: number,
  passed: boolean
) {
  const percentage = Math.round((score / totalQuestions) * 100);
  const emoji = passed ? '🎉' : '💪';

  return whatsapp.sendButtons(
    phoneNumber,
    `${emoji} Quiz Results

Score: ${score}/${totalQuestions} (${percentage}%)

${
  passed
    ? 'Congratulations! You passed! 🎉\n\nYou can move on to the next lesson.'
    : "Keep practicing! You'll get it! 💪\n\nReview the material and try again."
}`,
    passed
      ? [
          { id: 'next_lesson', title: 'Next Lesson' },
          { id: 'review', title: 'Review Material' },
        ]
      : [
          { id: 'review', title: 'Review Material' },
          { id: 'retake', title: 'Retake Quiz' },
          { id: 'get_help', title: 'Get Help' },
        ],
    {
      header: 'Quiz Complete',
    }
  );
}

/**
 * Payment confirmation message
 */
export async function sendPaymentConfirmation(
  whatsapp: WhatsAppService,
  phoneNumber: string,
  courseName: string,
  amount: number,
  receiptNumber: string
) {
  return whatsapp.sendText(
    phoneNumber,
    `✅ Payment Confirmed!

Course: ${courseName}
Amount: KES ${amount.toLocaleString()}
Receipt: ${receiptNumber}

You now have full access to the course! 🎉

Ready to start learning?`,
    false
  );
}

/**
 * Certificate earned message
 */
export async function sendCertificate(
  whatsapp: WhatsAppService,
  phoneNumber: string,
  courseName: string,
  certificateUrl: string,
  certificateNumber: string
) {
  return whatsapp.sendButtons(
    phoneNumber,
    `🎓 Congratulations!

You've completed:
${courseName}

Certificate #${certificateNumber}

Your certificate is ready! You can:
• Download it
• Share on LinkedIn
• Add to your CV

${certificateUrl}`,
    [
      { id: 'download_cert', title: 'Download' },
      { id: 'share_cert', title: 'Share' },
      { id: 'more_courses', title: 'More Courses' },
    ],
    {
      header: 'Certificate Earned! 🎓',
    }
  );
}

/**
 * Study group invitation
 */
export async function sendStudyGroupInvite(
  whatsapp: WhatsAppService,
  phoneNumber: string,
  groupName: string,
  courseName: string,
  members: number
) {
  return whatsapp.sendButtons(
    phoneNumber,
    `👥 Join a Study Group!

${groupName}

Course: ${courseName}
Members: ${members} students

Study together, help each other, stay motivated!`,
    [
      { id: 'join_group', title: 'Join Group' },
      { id: 'maybe_later', title: 'Maybe Later' },
    ],
    {
      header: 'Study Group Invitation',
      footer: 'Learning is better together!',
    }
  );
}

/**
 * Error / Support message
 */
export async function sendErrorMessage(
  whatsapp: WhatsAppService,
  phoneNumber: string,
  errorContext?: string
) {
  return whatsapp.sendButtons(
    phoneNumber,
    `Oops! Something went wrong 😅

${errorContext ? errorContext : 'We encountered an issue processing your request.'}

No worries! Here's what you can do:`,
    [
      { id: 'retry', title: 'Try Again' },
      { id: 'contact_support', title: 'Contact Support' },
      { id: 'go_home', title: 'Go to Home' },
    ],
    {
      header: 'Error',
      footer: "We're here to help!",
    }
  );
}
