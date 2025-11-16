# @lms/ai-tutor

AI-powered tutoring system using Claude and OpenAI for 24/7 learning support.

## Features

- 🤖 Context-aware tutoring based on current lesson
- 💡 Concept explanations in simple terms
- 🔍 Code review and feedback
- 🐛 Code debugging assistance
- 📝 Practice exercise generation
- 🎯 Step-by-step guidance
- 🌍 Adapted for African learners

## Installation

```bash
pnpm install
```

## Environment Variables

Add to your `.env` file:

```bash
# Use either Claude or OpenAI
AI_TUTOR_PROVIDER=claude  # or 'openai'

# Claude
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI
OPENAI_API_KEY=sk-...
```

## Usage

### Initialize the service

```typescript
import { AITutorService } from '@lms/ai-tutor';

const tutor = new AITutorService({
  provider: 'claude', // or 'openai'
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: 'claude-3-5-sonnet-20241022', // optional
});
```

### Ask a question

```typescript
const response = await tutor.askQuestion('How do I use CSS Flexbox?', {
  courseTitle: 'Web Development Fundamentals',
  lessonTitle: 'CSS Flexbox Layout',
  userLevel: 'beginner',
});

console.log(response.message);
// Includes suggestions and code examples
```

### Explain a concept

```typescript
const explanation = await tutor.explainConcept('recursion', {
  courseTitle: 'Python for Data Science',
  lessonTitle: 'Functions in Python',
  userLevel: 'intermediate',
});
```

### Review code

```typescript
const feedback = await tutor.reviewCode(
  `
function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}
  `,
  'javascript',
  {
    courseTitle: 'JavaScript Basics',
    lessonTitle: 'Functions and Arrays',
  }
);
```

### Debug code

```typescript
const help = await tutor.debugCode(
  `
def greet(name):
  print("Hello, " + name
  `,
  'SyntaxError: unexpected EOF while parsing',
  'python',
  {
    courseTitle: 'Python Basics',
    lessonTitle: 'Functions',
  }
);
```

### Generate practice exercises

```typescript
const exercise = await tutor.generateExercise('for loops', 'medium', {
  courseTitle: 'Python Basics',
  lessonTitle: 'Loops in Python',
});
```

### Conversational context

```typescript
const context = {
  courseTitle: 'Web Development',
  lessonTitle: 'HTML Forms',
  previousMessages: [
    { role: 'user', content: 'What is a form element?' },
    {
      role: 'assistant',
      content: 'A form element is used to collect user input...',
    },
  ],
};

const response = await tutor.askQuestion('Can you show me an example?', context);
```

## Response Format

```typescript
interface TutorResponse {
  message: string; // Main response text
  suggestions?: string[]; // Extracted bullet points
  codeExamples?: string[]; // Code blocks from response
  resources?: Array<{
    // Additional resources (future)
    title: string;
    url: string;
  }>;
}
```

## Models

### Claude (Recommended)

- `claude-3-5-sonnet-20241022` (default) - Best balance
- `claude-3-opus-20240229` - Most capable
- `claude-3-haiku-20240307` - Fastest, cheaper

### OpenAI

- `gpt-4-turbo-preview` (default) - Best quality
- `gpt-3.5-turbo` - Faster, cheaper

## Best Practices

1. **Provide Context**: Always include course and lesson information
2. **Set User Level**: Helps tailor explanations appropriately
3. **Maintain Conversation**: Pass previous messages for better context
4. **Cache Responses**: Consider caching common questions
5. **Rate Limiting**: Implement rate limits for API calls
6. **Error Handling**: Handle API errors gracefully

## Features for African Learners

- Uses examples relevant to African contexts
- Simple, clear language
- Practical, real-world applications
- Encouraging and supportive tone
- Patient explanations
- Cultural awareness

## Integration with WhatsApp

```typescript
import { AITutorService } from '@lms/ai-tutor';
import { WhatsAppService } from '@lms/whatsapp';

// User asks question via WhatsApp
const userMessage = 'How do I create a function in Python?';

const response = await tutor.askQuestion(userMessage, context);

await whatsapp.sendTextMessage(phoneNumber, response.message);

// Send code examples if any
if (response.codeExamples) {
  for (const example of response.codeExamples) {
    await whatsapp.sendTextMessage(phoneNumber, `\`\`\`\n${example}\n\`\`\``);
  }
}
```

## Cost Management

- Claude Sonnet: ~$3 per million input tokens
- GPT-4 Turbo: ~$10 per million input tokens
- Set max_tokens to control costs
- Cache common responses
- Use cheaper models for simple questions
