import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { z } from 'zod';

// Types
export interface TutorConfig {
  provider: 'anthropic' | 'openai';
  model?: string;
  anthropicApiKey?: string;
  openaiApiKey?: string;
}

export interface TutorContext {
  userId: string;
  lessonId?: string;
  courseId?: string;
  conversationHistory?: ConversationMessage[];
  lessonContent?: string;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic';
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface TutorResponse {
  message: string;
  suggestedActions?: SuggestedAction[];
  learningInsights?: LearningInsight[];
  metadata?: {
    model: string;
    tokensUsed: number;
    costUsd: number;
  };
}

export interface SuggestedAction {
  type: 'next_lesson' | 'practice_exercise' | 'review_concept' | 'take_quiz';
  title: string;
  description: string;
  actionData?: any;
}

export interface LearningInsight {
  type: 'strength' | 'weakness' | 'progress' | 'recommendation';
  message: string;
}

/**
 * AI Tutor Service
 *
 * Provides personalized tutoring using Claude or GPT-4
 */
export class AITutor {
  private anthropic?: Anthropic;
  private openai?: OpenAI;
  private config: TutorConfig;

  constructor(config: TutorConfig) {
    this.config = config;

    if (config.provider === 'anthropic' && config.anthropicApiKey) {
      this.anthropic = new Anthropic({
        apiKey: config.anthropicApiKey,
      });
    } else if (config.provider === 'openai' && config.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: config.openaiApiKey,
      });
    } else {
      throw new Error('API key not provided for selected provider');
    }
  }

  /**
   * Generate a tutoring response
   */
  async chat(userMessage: string, context: TutorContext): Promise<TutorResponse> {
    if (this.config.provider === 'anthropic') {
      return this.chatWithClaude(userMessage, context);
    } else {
      return this.chatWithGPT(userMessage, context);
    }
  }

  /**
   * Claude-powered tutoring
   */
  private async chatWithClaude(
    userMessage: string,
    context: TutorContext
  ): Promise<TutorResponse> {
    if (!this.anthropic) {
      throw new Error('Anthropic client not initialized');
    }

    // Build system prompt based on context
    const systemPrompt = this.buildSystemPrompt(context);

    // Build conversation history
    const messages: Anthropic.MessageParam[] = [
      ...(context.conversationHistory || []).map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: userMessage,
      },
    ];

    try {
      const response = await this.anthropic.messages.create({
        model: this.config.model || 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      });

      const assistantMessage = response.content[0];
      const messageText = assistantMessage.type === 'text' ? assistantMessage.text : '';

      // Calculate cost (approximate)
      const inputTokens = response.usage.input_tokens;
      const outputTokens = response.usage.output_tokens;
      const costUsd = this.calculateClaudeCost(inputTokens, outputTokens);

      // Parse for suggested actions (if any)
      const suggestedActions = this.extractSuggestedActions(messageText);

      return {
        message: messageText,
        suggestedActions,
        metadata: {
          model: response.model,
          tokensUsed: inputTokens + outputTokens,
          costUsd,
        },
      };
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw new Error('Failed to generate tutor response');
    }
  }

  /**
   * GPT-powered tutoring (fallback)
   */
  private async chatWithGPT(
    userMessage: string,
    context: TutorContext
  ): Promise<TutorResponse> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const systemPrompt = this.buildSystemPrompt(context);

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...(context.conversationHistory || []).map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model || 'gpt-4-turbo-preview',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      const messageText = response.choices[0].message.content || '';
      const tokensUsed = response.usage?.total_tokens || 0;
      const costUsd = this.calculateGPTCost(tokensUsed);

      return {
        message: messageText,
        metadata: {
          model: response.model,
          tokensUsed,
          costUsd,
        },
      };
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw new Error('Failed to generate tutor response');
    }
  }

  /**
   * Build context-aware system prompt
   */
  private buildSystemPrompt(context: TutorContext): string {
    const basePrompt = `You are an expert AI tutor for SkillHub Africa, an educational platform helping students across Africa learn new skills.

Your teaching style:
- Socratic method: Ask guiding questions instead of giving direct answers
- Use simple, clear explanations with real-world examples from African context
- Encourage critical thinking and problem-solving
- Be patient, supportive, and enthusiastic
- Use analogies and metaphors to explain complex concepts
- Adapt to the student's level and pace
- Celebrate progress and encourage effort

Communication style:
- Friendly and conversational (but professional)
- Use occasional Kenyan slang when appropriate (e.g., "sawa" for okay)
- Keep responses concise (2-3 paragraphs max for WhatsApp)
- Use emojis sparingly to keep it engaging
- Format code blocks with triple backticks when needed`;

    // Add lesson-specific context
    let contextPrompt = '';

    if (context.lessonContent) {
      contextPrompt += `\n\nCurrent lesson content:\n${context.lessonContent}`;
    }

    if (context.userLevel) {
      contextPrompt += `\n\nStudent level: ${context.userLevel}`;
    }

    if (context.learningStyle) {
      contextPrompt += `\n\nPreferred learning style: ${context.learningStyle}`;

      if (context.learningStyle === 'visual') {
        contextPrompt += '\nUse diagrams, code examples, and visual analogies.';
      } else if (context.learningStyle === 'auditory') {
        contextPrompt += '\nUse verbal explanations, discussions, and spoken analogies.';
      } else if (context.learningStyle === 'kinesthetic') {
        contextPrompt += '\nSuggest hands-on exercises, interactive coding, and practical projects.';
      }
    }

    return basePrompt + contextPrompt;
  }

  /**
   * Extract suggested actions from AI response
   */
  private extractSuggestedActions(message: string): SuggestedAction[] {
    const actions: SuggestedAction[] = [];

    // Simple pattern matching for common suggestions
    if (message.toLowerCase().includes('try this exercise') ||
        message.toLowerCase().includes('practice')) {
      actions.push({
        type: 'practice_exercise',
        title: 'Practice Exercise',
        description: 'Try the suggested exercise to reinforce your learning',
      });
    }

    if (message.toLowerCase().includes('next lesson') ||
        message.toLowerCase().includes('move on')) {
      actions.push({
        type: 'next_lesson',
        title: 'Continue Learning',
        description: 'Ready for the next lesson',
      });
    }

    if (message.toLowerCase().includes('quiz') ||
        message.toLowerCase().includes('test your')) {
      actions.push({
        type: 'take_quiz',
        title: 'Take Quiz',
        description: 'Test your understanding',
      });
    }

    return actions;
  }

  /**
   * Calculate Claude API cost
   */
  private calculateClaudeCost(inputTokens: number, outputTokens: number): number {
    // Claude 3.5 Sonnet pricing (as of 2024)
    const inputCostPer1M = 3.00; // $3 per million input tokens
    const outputCostPer1M = 15.00; // $15 per million output tokens

    const inputCost = (inputTokens / 1_000_000) * inputCostPer1M;
    const outputCost = (outputTokens / 1_000_000) * outputCostPer1M;

    return inputCost + outputCost;
  }

  /**
   * Calculate GPT API cost
   */
  private calculateGPTCost(totalTokens: number): number {
    // GPT-4 Turbo pricing (approximate)
    const costPer1M = 10.00; // $10 per million tokens
    return (totalTokens / 1_000_000) * costPer1M;
  }

  /**
   * Explain a concept (specialized method)
   */
  async explainConcept(
    concept: string,
    context: TutorContext
  ): Promise<TutorResponse> {
    const prompt = `Explain "${concept}" in simple terms. Use an analogy or real-world example from Kenyan/African context if possible.`;
    return this.chat(prompt, context);
  }

  /**
   * Review student's code
   */
  async reviewCode(
    code: string,
    language: string,
    context: TutorContext
  ): Promise<TutorResponse> {
    const prompt = `Review this ${language} code and provide constructive feedback:

\`\`\`${language}
${code}
\`\`\`

Focus on:
1. Correctness - Does it work?
2. Best practices - Is it following conventions?
3. Improvements - What could be better?
4. Learning - What concept should the student understand better?

Keep feedback encouraging and educational.`;

    return this.chat(prompt, context);
  }

  /**
   * Generate practice exercise
   */
  async generateExercise(
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    context: TutorContext
  ): Promise<TutorResponse> {
    const prompt = `Create a ${difficulty} practice exercise about ${topic}.

Include:
1. Clear problem statement
2. Example input/output
3. Hints (but not the solution)
4. What the student should learn from this

Format it so it's easy to understand via WhatsApp.`;

    return this.chat(prompt, context);
  }
}

// Export helper function to create tutor instance
export function createAITutor(config: TutorConfig): AITutor {
  return new AITutor(config);
}

// Export types
export type {
  TutorConfig,
  TutorContext,
  ConversationMessage,
  TutorResponse,
  SuggestedAction,
  LearningInsight,
};
