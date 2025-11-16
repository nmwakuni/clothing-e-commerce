import { WhatsAppService } from '../index';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizSession {
  userId: string;
  lessonId: string;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answers: number[];
  score: number;
}

export class QuizHandler {
  private activeSessions: Map<string, QuizSession> = new Map();

  constructor(private whatsappService: WhatsAppService) {}

  async startQuiz(
    phoneNumber: string,
    userId: string,
    lessonId: string,
    questions: QuizQuestion[]
  ): Promise<void> {
    const session: QuizSession = {
      userId,
      lessonId,
      questions,
      currentQuestionIndex: 0,
      answers: [],
      score: 0,
    };

    this.activeSessions.set(phoneNumber, session);

    await this.whatsappService.sendTextMessage(
      phoneNumber,
      `📝 *Quiz Started!*\n\n${questions.length} questions\n\nLet's begin! 🚀`
    );

    await this.delay(1000);
    await this.sendQuestion(phoneNumber);
  }

  async handleAnswer(phoneNumber: string, answerText: string): Promise<void> {
    const session = this.activeSessions.get(phoneNumber);
    if (!session) {
      await this.whatsappService.sendTextMessage(
        phoneNumber,
        '❌ No active quiz session. Type "start quiz" to begin!'
      );
      return;
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];

    // Parse answer (A, B, C, D or 1, 2, 3, 4)
    let answerIndex = -1;
    const upperAnswer = answerText.toUpperCase().trim();

    if (['A', 'B', 'C', 'D'].includes(upperAnswer)) {
      answerIndex = upperAnswer.charCodeAt(0) - 'A'.charCodeAt(0);
    } else if (/^[1-4]$/.test(answerText)) {
      answerIndex = parseInt(answerText) - 1;
    }

    if (answerIndex === -1 || answerIndex >= currentQuestion.options.length) {
      await this.whatsappService.sendTextMessage(
        phoneNumber,
        '❌ Invalid answer. Please reply with A, B, C, D or 1, 2, 3, 4'
      );
      return;
    }

    // Check answer
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    session.answers.push(answerIndex);

    if (isCorrect) {
      session.score++;
      let feedback = '✅ *Correct!*';
      if (currentQuestion.explanation) {
        feedback += `\n\n💡 ${currentQuestion.explanation}`;
      }
      await this.whatsappService.sendTextMessage(phoneNumber, feedback);
    } else {
      const correctOption = currentQuestion.options[currentQuestion.correctAnswer];
      let feedback = `❌ *Incorrect*\n\n✓ Correct answer: ${String.fromCharCode(65 + currentQuestion.correctAnswer)}. ${correctOption}`;
      if (currentQuestion.explanation) {
        feedback += `\n\n💡 ${currentQuestion.explanation}`;
      }
      await this.whatsappService.sendTextMessage(phoneNumber, feedback);
    }

    await this.delay(2000);

    // Move to next question or finish quiz
    session.currentQuestionIndex++;

    if (session.currentQuestionIndex < session.questions.length) {
      await this.sendQuestion(phoneNumber);
    } else {
      await this.finishQuiz(phoneNumber, session);
    }
  }

  private async sendQuestion(phoneNumber: string): Promise<void> {
    const session = this.activeSessions.get(phoneNumber);
    if (!session) return;

    const question = session.questions[session.currentQuestionIndex];
    const questionNumber = session.currentQuestionIndex + 1;
    const totalQuestions = session.questions.length;

    let message = `*Question ${questionNumber}/${totalQuestions}*\n\n${question.question}\n\n`;

    question.options.forEach((option, index) => {
      const letter = String.fromCharCode(65 + index); // A, B, C, D
      message += `${letter}. ${option}\n`;
    });

    message += '\n💬 Reply with A, B, C, or D';

    await this.whatsappService.sendTextMessage(phoneNumber, message);
  }

  private async finishQuiz(phoneNumber: string, session: QuizSession): Promise<void> {
    const percentage = Math.round((session.score / session.questions.length) * 100);
    const passed = percentage >= 70;

    let message = `🎉 *Quiz Complete!*\n\n`;
    message += `📊 Score: ${session.score}/${session.questions.length} (${percentage}%)\n\n`;

    if (passed) {
      message += `✅ *Passed!* Well done! 🎊\n\n`;
      message += `You can now continue to the next lesson.`;
    } else {
      message += `📚 *Keep Learning*\n\n`;
      message += `You need 70% to pass. Review the material and try again!`;
    }

    await this.whatsappService.sendTextMessage(phoneNumber, message);

    await this.delay(1000);

    if (passed) {
      await this.whatsappService.sendButtonMessage(phoneNumber, 'What would you like to do next?', [
        { id: `next_lesson_${session.lessonId}`, title: '▶️ Next Lesson' },
        { id: 'back_to_menu', title: '🏠 Main Menu' },
      ]);
    } else {
      await this.whatsappService.sendButtonMessage(phoneNumber, 'Would you like to retry?', [
        { id: `retry_quiz_${session.lessonId}`, title: '🔄 Retry Quiz' },
        { id: 'back_to_menu', title: '🏠 Main Menu' },
      ]);
    }

    // Clean up session
    this.activeSessions.delete(phoneNumber);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
