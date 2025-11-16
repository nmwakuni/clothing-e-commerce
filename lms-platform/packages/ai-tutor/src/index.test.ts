import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AITutorService } from './index';

// Mock the AI SDKs
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(() => ({
    messages: {
      create: vi.fn(),
    },
  })),
}));

vi.mock('openai', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}));

describe('AITutorService', () => {
  describe('with Claude provider', () => {
    let tutor: AITutorService;

    beforeEach(() => {
      tutor = new AITutorService({
        provider: 'claude',
        apiKey: 'test-key',
      });
    });

    it('should initialize with Claude provider', () => {
      expect(tutor).toBeDefined();
    });

    it('should parse response correctly', async () => {
      const mockResponse = {
        content: [
          {
            type: 'text',
            text: '# Example\nHere is an explanation.\n\n```python\nprint("hello")\n```',
          },
        ],
      };

      // Mock the Anthropic client
      const anthropic = (tutor as any).anthropic;
      if (anthropic) {
        anthropic.messages.create = vi.fn().mockResolvedValue(mockResponse);

        const result = await tutor.askQuestion('How do I print in Python?', {
          courseTitle: 'Python Basics',
          lessonTitle: 'Introduction',
        });

        expect(result.message).toContain('explanation');
        expect(result.codeExamples).toBeDefined();
        if (result.codeExamples) {
          expect(result.codeExamples.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('with OpenAI provider', () => {
    let tutor: AITutorService;

    beforeEach(() => {
      tutor = new AITutorService({
        provider: 'openai',
        apiKey: 'test-key',
      });
    });

    it('should initialize with OpenAI provider', () => {
      expect(tutor).toBeDefined();
    });
  });

  describe('utility methods', () => {
    let tutor: AITutorService;

    beforeEach(() => {
      tutor = new AITutorService({
        provider: 'claude',
        apiKey: 'test-key',
      });
    });

    it('should build system prompt with context', () => {
      const prompt = (tutor as any).buildSystemPrompt({
        courseTitle: 'Web Development',
        lessonTitle: 'HTML Basics',
        userLevel: 'beginner',
      });

      expect(prompt).toContain('Web Development');
      expect(prompt).toContain('HTML Basics');
      expect(prompt).toContain('beginner');
      expect(prompt).toContain('SkillHub Africa');
    });

    it('should parse code examples from response', () => {
      const message =
        'Here is code:\n```python\nprint("hello")\n```\n\nAnd more:\n```js\nconsole.log("hi")\n```';
      const result = (tutor as any).parseResponse(message);

      expect(result.codeExamples).toBeDefined();
      expect(result.codeExamples?.length).toBe(2);
      expect(result.codeExamples?.[0]).toContain('print');
      expect(result.codeExamples?.[1]).toContain('console.log');
    });

    it('should parse suggestions from response', () => {
      const message = 'Tips:\n- First tip\n- Second tip\n* Third tip';
      const result = (tutor as any).parseResponse(message);

      expect(result.suggestions).toBeDefined();
      expect(result.suggestions?.length).toBeGreaterThan(0);
    });
  });
});
