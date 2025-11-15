import { WhatsAppService } from '../index';
import { LessonHandler, Lesson } from '../handlers/lesson-handler';
import { QuizHandler } from '../handlers/quiz-handler';
import { MenuHandler } from '../handlers/menu-handler';

export interface UserProgress {
  userId: string;
  courseId: string;
  currentLessonId: string;
  completedLessons: string[];
  phoneNumber: string;
}

export class LessonDeliveryService {
  private lessonHandler: LessonHandler;
  private quizHandler: QuizHandler;
  private menuHandler: MenuHandler;

  constructor(private whatsappService: WhatsAppService) {
    this.lessonHandler = new LessonHandler(whatsappService);
    this.quizHandler = new QuizHandler(whatsappService);
    this.menuHandler = new MenuHandler(whatsappService);
  }

  async sendDailyReminder(
    phoneNumber: string,
    userName: string,
    lessonsCompleted: number
  ): Promise<void> {
    const messages = [
      `Good morning ${userName}! ☀️\n\nReady to learn something new today? You've completed ${lessonsCompleted} lessons so far. Keep it up! 💪`,
      `Hi ${userName}! 👋\n\nYour daily dose of knowledge is waiting! You're making great progress with ${lessonsCompleted} lessons done. 🎯`,
      `Hello ${userName}! 🌟\n\nTime to level up your skills! ${lessonsCompleted} lessons completed - you're on fire! 🔥`,
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    await this.whatsappService.sendButtonMessage(phoneNumber, randomMessage, [
      { id: 'continue_learning', title: '▶️ Continue Learning' },
      { id: 'my_progress', title: '📊 My Progress' },
    ]);
  }

  async sendStreakReminder(phoneNumber: string, userName: string, streak: number): Promise<void> {
    await this.whatsappService.sendTextMessage(
      phoneNumber,
      `🔥 Amazing ${userName}!\n\nYou're on a ${streak}-day learning streak! Don't break it today! 💪\n\nComplete at least one lesson to keep your streak going.`
    );

    await this.delay(1000);

    await this.whatsappService.sendButtonMessage(phoneNumber, 'Ready to learn?', [
      { id: 'continue_learning', title: '▶️ Start Learning' },
      { id: 'snooze_1h', title: '⏰ Remind me in 1h' },
    ]);
  }

  async sendAchievementNotification(
    phoneNumber: string,
    achievementTitle: string,
    achievementDescription: string,
    icon: string
  ): Promise<void> {
    await this.whatsappService.sendTextMessage(
      phoneNumber,
      `🏆 *Achievement Unlocked!*\n\n${icon} *${achievementTitle}*\n\n${achievementDescription}\n\nKeep up the great work! 🎉`
    );
  }

  async sendCourseCompletionMessage(
    phoneNumber: string,
    userName: string,
    courseName: string
  ): Promise<void> {
    await this.whatsappService.sendTextMessage(
      phoneNumber,
      `🎓 *Congratulations ${userName}!*\n\nYou've completed *${courseName}*! 🎉\n\nThis is a huge achievement. You should be proud! 💪`
    );

    await this.delay(1000);

    await this.whatsappService.sendButtonMessage(phoneNumber, 'Your certificate is ready!', [
      { id: 'get_certificate', title: '📜 Get Certificate' },
      { id: 'share_achievement', title: '🎊 Share' },
      { id: 'browse_courses', title: '🔍 Next Course' },
    ]);
  }

  async sendWeeklyProgress(
    phoneNumber: string,
    userName: string,
    stats: {
      lessonsCompleted: number;
      hoursLearned: number;
      xpEarned: number;
      streak: number;
    }
  ): Promise<void> {
    const message = `📊 *Weekly Progress Report*\n\nHi ${userName}! Here's your learning summary:\n\n✅ Lessons completed: ${stats.lessonsCompleted}\n⏱️ Hours learned: ${stats.hoursLearned}\n⭐ XP earned: ${stats.xpEarned}\n🔥 Current streak: ${stats.streak} days\n\nKeep up the excellent work! 💪`;

    await this.whatsappService.sendTextMessage(phoneNumber, message);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Expose handlers for use in API routes
  getLessonHandler(): LessonHandler {
    return this.lessonHandler;
  }

  getQuizHandler(): QuizHandler {
    return this.quizHandler;
  }

  getMenuHandler(): MenuHandler {
    return this.menuHandler;
  }
}
