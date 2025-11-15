# @lms/ai-tutor

AI-powered tutoring service using Claude 3.5 Sonnet and GPT-4.

## Features

- 🧠 **Intelligent tutoring** using Claude or GPT-4
- 📚 **Multiple teaching strategies** (Socratic method, worked examples, etc.)
- 🌍 **Culturally relevant** (uses African/Kenyan context in examples)
- 💬 **Conversational** (optimized for WhatsApp messaging)
- 🎯 **Personalized** (adapts to student level and learning style)
- 📊 **Cost tracking** (monitors token usage and costs)

## Usage

```typescript
import { createAITutor, TutorContext } from '@lms/ai-tutor';

// Create tutor instance
const tutor = createAITutor({
  provider: 'anthropic',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-5-sonnet-20241022', // optional
});

// Set up context
const context: TutorContext = {
  userId: 'user_123',
  lessonId: 'lesson_html_basics',
  courseId: 'course_web_dev',
  userLevel: 'beginner',
  learningStyle: 'visual',
  lessonContent: 'HTML is the structure of web pages...',
  conversationHistory: [
    { role: 'user', content: 'What is HTML?' },
    { role: 'assistant', content: 'HTML is like the skeleton of a website...' },
  ],
};

// Chat with tutor
const response = await tutor.chat('I don\'t understand tags', context);
console.log(response.message);

// Specialized methods
const explanation = await tutor.explainConcept('variables', context);
const codeReview = await tutor.reviewCode('print("hello")', 'python', context);
const exercise = await tutor.generateExercise('loops', 'easy', context);
```

## Teaching Strategies

The AI tutor uses proven pedagogical approaches:

### Socratic Method
Guides students to discover answers through questions:
```
Student: "I don't understand recursion"
Tutor: "Great question! Have you seen Russian nesting dolls?
       How is that similar to a function calling itself?"
```

### Contextual Learning
Uses familiar African/Kenyan examples:
```
- Variables → M-Pesa wallets
- Arrays → Matatu routes
- Functions → Chapati recipes
- APIs → Calling a taxi via phone
```

### Growth Mindset
Encourages persistence and learning from mistakes:
```
"That's a great attempt! You're thinking in the right direction."
"Making mistakes means you're learning."
```

### Chunking
Breaks complex topics into digestible pieces:
```
1. Big picture (what & why)
2. Smaller concepts
3. Connect pieces
4. Review whole
```

## Configuration

### Provider: Anthropic (Claude)
```typescript
{
  provider: 'anthropic',
  anthropicApiKey: 'sk-ant-...',
  model: 'claude-3-5-sonnet-20241022' // or claude-3-opus-20240229
}
```

### Provider: OpenAI (GPT-4)
```typescript
{
  provider: 'openai',
  openaiApiKey: 'sk-...',
  model: 'gpt-4-turbo-preview' // or gpt-3.5-turbo
}
```

## Response Format

```typescript
{
  message: string;              // AI tutor's response
  suggestedActions?: [          // Optional actions
    {
      type: 'practice_exercise' | 'next_lesson' | 'take_quiz' | 'review_concept',
      title: string,
      description: string,
    }
  ];
  learningInsights?: [           // Student performance insights
    {
      type: 'strength' | 'weakness' | 'progress',
      message: string,
    }
  ];
  metadata: {
    model: string;               // Model used
    tokensUsed: number;          // Total tokens
    costUsd: number;             // Approximate cost
  }
}
```

## Cost Management

The package tracks API costs:
- **Claude 3.5 Sonnet**: ~$0.003 per 1K input tokens, ~$0.015 per 1K output tokens
- **GPT-4 Turbo**: ~$0.01 per 1K tokens

Example costs per conversation:
- Simple question (500 tokens): ~$0.005
- Code review (1500 tokens): ~$0.015
- Complex explanation (2000 tokens): ~$0.020

## Best Practices

1. **Pass conversation history** for context-aware responses
2. **Include lesson content** for accurate, relevant answers
3. **Set user level** (beginner/intermediate/advanced) for appropriate complexity
4. **Specify learning style** for personalized teaching
5. **Monitor costs** using metadata.costUsd
6. **Implement caching** to reduce API calls for common questions

## Examples

### Explaining a Concept
```typescript
const response = await tutor.explainConcept('variables', {
  userId: 'user_123',
  userLevel: 'beginner',
  learningStyle: 'visual',
});
// "Think of a variable like an M-Pesa wallet. It stores a value (money)
//  and you can change what's inside..."
```

### Reviewing Code
```typescript
const response = await tutor.reviewCode(
  'def hello():\nprint("hello")',
  'python',
  context
);
// "Good start! Your function works correctly. Here's how to improve it:
//  1. Add a parameter to make it flexible..."
```

### Generating Practice
```typescript
const response = await tutor.generateExercise('loops', 'easy', context);
// "Exercise: Count from 1 to 10
//  Write a Python loop that prints numbers 1 through 10.
//  Hint: Use the range() function..."
```

## Development

```bash
# Type checking
pnpm type-check
```

## License

MIT
