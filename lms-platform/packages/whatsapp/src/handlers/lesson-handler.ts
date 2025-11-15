import { WhatsAppService } from '../index';

export interface Lesson {
  id: string;
  title: string;
  contentType: 'text' | 'video' | 'interactive' | 'quiz';
  contentData: any;
  estimatedMinutes: number;
}

export class LessonHandler {
  constructor(private whatsappService: WhatsAppService) {}

  async deliverLesson(phoneNumber: string, lesson: Lesson): Promise<void> {
    // Send lesson header
    await this.whatsappService.sendTextMessage(
      phoneNumber,
      `📖 *${lesson.title}*\n\n⏱️ Estimated time: ${lesson.estimatedMinutes} minutes\n\n━━━━━━━━━━━━━━━`
    );

    // Wait a moment before sending content
    await this.delay(1000);

    // Deliver content based on type
    switch (lesson.contentType) {
      case 'text':
        await this.deliverTextLesson(phoneNumber, lesson);
        break;
      case 'video':
        await this.deliverVideoLesson(phoneNumber, lesson);
        break;
      case 'interactive':
        await this.deliverInteractiveLesson(phoneNumber, lesson);
        break;
      case 'quiz':
        await this.deliverQuizLesson(phoneNumber, lesson);
        break;
    }
  }

  private async deliverTextLesson(phoneNumber: string, lesson: Lesson): Promise<void> {
    const { markdown, readingTime } = lesson.contentData;

    // Convert markdown to WhatsApp-friendly text
    const formattedText = this.formatMarkdownForWhatsApp(markdown);

    // Split into chunks if too long (WhatsApp has 4096 char limit)
    const chunks = this.splitIntoChunks(formattedText, 4000);

    for (const chunk of chunks) {
      await this.whatsappService.sendTextMessage(phoneNumber, chunk);
      await this.delay(500);
    }

    // Send completion button
    await this.whatsappService.sendButtonMessage(
      phoneNumber,
      `📚 Reading time: ~${readingTime} minutes\n\nDid you finish reading?`,
      [
        { id: `complete_lesson_${lesson.id}`, title: '✅ Mark Complete' },
        { id: 'need_help', title: '❓ Need Help' },
      ]
    );
  }

  private async deliverVideoLesson(phoneNumber: string, lesson: Lesson): Promise<void> {
    const { url, duration } = lesson.contentData;

    await this.whatsappService.sendTextMessage(
      phoneNumber,
      `🎥 *Video Lesson*\n\n⏱️ Duration: ${Math.floor(duration / 60)} minutes\n\n🔗 Watch here: ${url}\n\nWatch the video and come back when you're done!`
    );

    await this.delay(1000);

    await this.whatsappService.sendButtonMessage(
      phoneNumber,
      'Have you finished watching the video?',
      [
        { id: `complete_lesson_${lesson.id}`, title: '✅ I finished!' },
        { id: 'watch_later', title: '⏰ Watch Later' },
      ]
    );
  }

  private async deliverInteractiveLesson(phoneNumber: string, lesson: Lesson): Promise<void> {
    const { exerciseType, codeTemplate } = lesson.contentData;

    await this.whatsappService.sendTextMessage(
      phoneNumber,
      `💻 *Interactive Exercise*\n\nThis lesson requires hands-on practice.\n\nGo to the web app to complete this exercise:\n\n🔗 https://skillhub.co.ke/lessons/${lesson.id}`
    );

    await this.delay(1000);

    await this.whatsappService.sendButtonMessage(
      phoneNumber,
      'Once you complete the exercise on the web, come back here!',
      [
        { id: `check_exercise_${lesson.id}`, title: '🔄 Check Status' },
        { id: 'need_help', title: '❓ Need Help' },
      ]
    );
  }

  private async deliverQuizLesson(phoneNumber: string, lesson: Lesson): Promise<void> {
    await this.whatsappService.sendTextMessage(
      phoneNumber,
      `📝 *Quiz Time!*\n\nTest your knowledge with this quiz.\n\nI'll send you questions one by one. Reply with your answer!`
    );

    // Quiz will be handled by QuizHandler
  }

  private formatMarkdownForWhatsApp(markdown: string): string {
    return (
      markdown
        // Convert markdown bold to WhatsApp bold
        .replace(/\*\*(.*?)\*\*/g, '*$1*')
        // Convert markdown italic to WhatsApp italic
        .replace(/_(.*?)_/g, '_$1_')
        // Convert markdown code blocks
        .replace(/```(.*?)```/gs, '```$1```')
        // Convert inline code
        .replace(/`(.*?)`/g, '`$1`')
        // Remove HTML tags
        .replace(/<[^>]*>/g, '')
    );
  }

  private splitIntoChunks(text: string, maxLength: number): string[] {
    const chunks: string[] = [];
    let currentChunk = '';

    const lines = text.split('\n');

    for (const line of lines) {
      if (currentChunk.length + line.length + 1 > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        // If a single line is longer than maxLength, split it
        if (line.length > maxLength) {
          const words = line.split(' ');
          for (const word of words) {
            if (currentChunk.length + word.length + 1 > maxLength) {
              chunks.push(currentChunk.trim());
              currentChunk = word + ' ';
            } else {
              currentChunk += word + ' ';
            }
          }
        } else {
          currentChunk = line + '\n';
        }
      } else {
        currentChunk += line + '\n';
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
