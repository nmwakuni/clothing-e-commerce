import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

export interface TutorConfig {
  provider: 'claude' | 'openai';
  apiKey: string;
  model?: string;
}

export interface LearningContext {
  courseTitle: string;
  lessonTitle: string;
  lessonContent?: string;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface TutorResponse {
  message: string;
  suggestions?: string[];
  codeExamples?: string[];
  resources?: Array<{ title: string; url: string }>;
}

export class AITutorService {
  private anthropic?: Anthropic;
  private openai?: OpenAI;
  private config: TutorConfig;

  constructor(config: TutorConfig) {
    this.config = config;

    if (config.provider === 'claude') {
      this.anthropic = new Anthropic({
        apiKey: config.apiKey,
      });
    } else if (config.provider === 'openai') {
      this.openai = new OpenAI({
        apiKey: config.apiKey,
      });
    }
  }

  /**
   * Get help from AI tutor with learning context
   */
  async askQuestion(question: string, context: LearningContext): Promise<TutorResponse> {
    const systemPrompt = this.buildSystemPrompt(context);

    if (this.config.provider === 'claude') {
      return this.askClaude(question, systemPrompt, context);
    } else {
      return this.askOpenAI(question, systemPrompt, context);
    }
  }

  /**
   * Explain a concept in simple terms
   */
  async explainConcept(concept: string, context: LearningContext): Promise<TutorResponse> {
    const question = `Can you explain "${concept}" in simple terms? Please use examples and analogies that are easy to understand.`;
    return this.askQuestion(question, context);
  }

  /**
   * Review and provide feedback on code
   */
  async reviewCode(
    code: string,
    language: string,
    context: LearningContext
  ): Promise<TutorResponse> {
    const question = `Please review this ${language} code and provide constructive feedback:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nFocus on:\n1. Correctness\n2. Best practices\n3. Potential improvements\n4. Learning opportunities`;
    return this.askQuestion(question, context);
  }

  /**
   * Debug code and find issues
   */
  async debugCode(
    code: string,
    error: string,
    language: string,
    context: LearningContext
  ): Promise<TutorResponse> {
    const question = `I'm getting this error:\n\`\`\`\n${error}\n\`\`\`\n\nIn this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nCan you help me understand what's wrong and how to fix it?`;
    return this.askQuestion(question, context);
  }

  /**
   * Generate practice exercises
   */
  async generateExercise(
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    context: LearningContext
  ): Promise<TutorResponse> {
    const question = `Generate a ${difficulty} practice exercise about "${topic}". Include:\n1. Problem description\n2. Example input/output\n3. Hints\n4. Solution approach (but not full solution)`;
    return this.askQuestion(question, context);
  }

  /**
   * Provide step-by-step guidance
   */
  async provideGuidance(task: string, context: LearningContext): Promise<TutorResponse> {
    const question = `I need to ${task}. Can you provide step-by-step guidance? Please break it down into clear, actionable steps.`;
    return this.askQuestion(question, context);
  }

  private async askClaude(
    question: string,
    systemPrompt: string,
    context: LearningContext
  ): Promise<TutorResponse> {
    if (!this.anthropic) {
      throw new Error('Claude client not initialized');
    }

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...(context.previousMessages || []),
      { role: 'user', content: question },
    ];

    const response = await this.anthropic.messages.create({
      model: this.config.model || 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    });

    const content = response.content[0];
    const message = content.type === 'text' ? content.text : '';

    return this.parseResponse(message);
  }

  private async askOpenAI(
    question: string,
    systemPrompt: string,
    context: LearningContext
  ): Promise<TutorResponse> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...(context.previousMessages || []),
      { role: 'user', content: question },
    ];

    const response = await this.openai.chat.completions.create({
      model: this.config.model || 'gpt-4-turbo-preview',
      messages,
      max_tokens: 2048,
      temperature: 0.7,
    });

    const message = response.choices[0].message.content || '';
    return this.parseResponse(message);
  }

  private buildSystemPrompt(context: LearningContext): string {
    const level = context.userLevel || 'beginner';

    return `You are an expert AI tutor for SkillHub Africa, an online learning platform focused on practical skills for African learners.

**Current Learning Context:**
- Course: ${context.courseTitle}
- Lesson: ${context.lessonTitle}
- Student Level: ${level}

**Your Role:**
- Provide clear, patient, and encouraging explanations
- Use analogies and real-world examples relevant to African contexts
- Break down complex concepts into simple steps
- Encourage critical thinking with guiding questions
- Adapt your language to the student's level (${level})
- Be supportive and build confidence
- Use code examples when helpful
- Provide practical applications and use cases

**Teaching Principles:**
1. Start with simple explanations, then add complexity
2. Use Socratic questioning to guide learning
3. Celebrate progress and effort
4. Provide constructive feedback
5. Encourage hands-on practice
6. Make connections to real-world applications

**Language Guidelines:**
- Use simple, clear English
- Define technical terms when first used
- Use bullet points for clarity
- Include code examples with comments
- Avoid jargon unless explaining it

${context.lessonContent ? `\n**Lesson Content Context:**\n${context.lessonContent.substring(0, 500)}...\n` : ''}

Remember: Your goal is to help the student understand and gain confidence, not just provide answers.`;
  }

  private parseResponse(message: string): TutorResponse {
    // Extract code examples
    const codeExamples: string[] = [];
    const codeBlockRegex = /```[\s\S]*?```/g;
    const codeMatches = message.match(codeBlockRegex);
    if (codeMatches) {
      codeExamples.push(...codeMatches.map((block) => block.replace(/```\w*\n?/g, '').trim()));
    }

    // Extract suggestions (bullet points)
    const suggestions: string[] = [];
    const bulletRegex = /^[•\-*]\s+(.+)$/gm;
    let match;
    while ((match = bulletRegex.exec(message)) !== null) {
      suggestions.push(match[1].trim());
    }

    return {
      message,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      codeExamples: codeExamples.length > 0 ? codeExamples : undefined,
    };
  }
}

// Export types
export type { Anthropic, OpenAI };
