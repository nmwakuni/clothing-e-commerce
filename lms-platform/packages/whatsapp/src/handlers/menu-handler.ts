import { WhatsAppService } from '../index';

export interface MenuOptions {
  userId: string;
  phoneNumber: string;
  userName?: string;
}

export class MenuHandler {
  constructor(private whatsappService: WhatsAppService) {}

  async sendMainMenu(options: MenuOptions): Promise<void> {
    const greeting = options.userName ? `Hi ${options.userName}! 👋` : 'Hi there! 👋';

    await this.whatsappService.sendListMessage(
      options.phoneNumber,
      `${greeting}\n\nWelcome to SkillHub Africa! What would you like to do today?`,
      'Main Menu',
      [
        {
          title: 'Learning',
          rows: [
            {
              id: 'my_courses',
              title: '📚 My Courses',
              description: 'View your enrolled courses',
            },
            {
              id: 'continue_learning',
              title: '▶️ Continue Learning',
              description: 'Resume your last lesson',
            },
            {
              id: 'browse_courses',
              title: '🔍 Browse Courses',
              description: 'Explore available courses',
            },
          ],
        },
        {
          title: 'Progress',
          rows: [
            {
              id: 'my_progress',
              title: '📊 My Progress',
              description: 'View your learning stats',
            },
            {
              id: 'achievements',
              title: '🏆 Achievements',
              description: 'See your badges and awards',
            },
          ],
        },
        {
          title: 'Help',
          rows: [
            {
              id: 'ai_tutor',
              title: '🤖 Ask AI Tutor',
              description: 'Get help from our AI assistant',
            },
            {
              id: 'help',
              title: '❓ Help',
              description: 'Learn how to use this platform',
            },
          ],
        },
      ]
    );
  }

  async sendCourseMenu(courseId: string, phoneNumber: string): Promise<void> {
    await this.whatsappService.sendButtonMessage(phoneNumber, 'What would you like to do?', [
      { id: `start_lesson_${courseId}`, title: '▶️ Start Lesson' },
      { id: `course_info_${courseId}`, title: 'ℹ️ Course Info' },
      { id: 'back_to_menu', title: '🔙 Main Menu' },
    ]);
  }

  async sendLessonCompleteMenu(
    phoneNumber: string,
    lessonId: string,
    hasNext: boolean
  ): Promise<void> {
    const buttons = hasNext
      ? [
          { id: `next_lesson_${lessonId}`, title: '▶️ Next Lesson' },
          { id: 'back_to_menu', title: '🏠 Main Menu' },
        ]
      : [
          { id: `certificate`, title: '🎓 Get Certificate' },
          { id: 'back_to_menu', title: '🏠 Main Menu' },
        ];

    await this.whatsappService.sendButtonMessage(
      phoneNumber,
      '✅ Lesson completed! What would you like to do next?',
      buttons
    );
  }
}
