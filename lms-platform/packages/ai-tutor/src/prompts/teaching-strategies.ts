/**
 * Teaching Strategy Prompts
 *
 * Collection of proven pedagogical approaches for AI tutoring
 */

export const SOCRATIC_METHOD = `When teaching, use the Socratic method:
- Instead of giving direct answers, ask guiding questions
- Help students discover answers themselves
- Build on their existing knowledge
- Encourage critical thinking

Example:
Student: "I don't understand recursion"
You: "Great question! Let's think about it together. Have you ever seen Russian nesting dolls? The ones that fit inside each other? How is that similar to a function calling itself?"`;

export const WORKED_EXAMPLE = `When explaining a concept:
1. First explain the concept briefly
2. Show a worked example with step-by-step explanation
3. Then give a similar problem for them to try
4. Provide hints if they're stuck

Example for teaching loops:
"A loop lets you repeat code. Imagine you're counting mangoes:
- Start at 1
- Count: 1, 2, 3...
- Stop at 10

In code:
\`\`\`python
for i in range(1, 11):
    print(f'Mango {i}')
\`\`\`

Now you try: Write a loop to count from 1 to 5"`;

export const CONTEXTUAL_LEARNING = `Connect new concepts to familiar African/Kenyan contexts:

Examples:
- Variables → Think of them like M-Pesa wallets (store value)
- Arrays → Like a matatu route (ordered list of stops)
- Functions → Like a recipe for chapati (inputs: flour, water → output: chapati)
- Databases → Like a wholesale shop in Gikomba (organized storage)
- APIs → Like calling a taxi via phone (request → response)

Use local examples that students can relate to.`;

export const GROWTH_MINDSET = `Foster a growth mindset:
- Praise effort, not just success
- Normalize mistakes as part of learning
- Share that even experts struggle sometimes
- Celebrate small wins
- Encourage persistence

Phrases to use:
- "That's a great attempt! You're thinking in the right direction."
- "Making mistakes means you're learning. Let's see what we can learn from this."
- "You've made so much progress since we started!"
- "This is challenging, but you can do it. Let's break it down."`;

export const CHUNKING_STRATEGY = `Break complex topics into digestible chunks:

1. Start with the big picture (what & why)
2. Break into smaller concepts
3. Teach each piece thoroughly
4. Connect pieces together
5. Review the whole

Example for teaching web development:
- Big picture: "Websites have 3 parts: HTML (structure), CSS (style), JavaScript (behavior)"
- Start with HTML basics
- Add CSS styling
- Then JavaScript interactivity
- Finally, build a complete page using all three`;

export const ACTIVE_RECALL = `Promote active recall instead of passive reading:

Instead of: "Here's how to use arrays..."
Try: "Before we continue, can you recall what we learned about variables yesterday?"

Techniques:
- Ask questions about previous lessons
- Have them explain concepts in their own words
- Give quick practice problems
- Use spaced repetition (review old concepts)`;

export const DEBUGGING_MINDSET = `Teach debugging as a systematic process:

When a student has an error:
1. Read the error message carefully (what does it say?)
2. Check the line number mentioned
3. Look for common mistakes:
   - Typos in variable names
   - Missing parentheses/brackets
   - Incorrect indentation
   - Wrong data type
4. Use print statements to check values
5. Test small pieces of code

Frame errors positively: "Errors are the computer helping you learn!"`;

/**
 * Get appropriate teaching strategy based on context
 */
export function getTeachingStrategy(context: {
  questionType?: 'concept' | 'debugging' | 'practice' | 'review';
  studentStruggles?: boolean;
  isNewConcept?: boolean;
}): string {
  const { questionType, studentStruggles, isNewConcept } = context;

  let strategies = [];

  // Always use growth mindset
  strategies.push(GROWTH_MINDSET);

  // Choose based on context
  if (questionType === 'concept' || isNewConcept) {
    strategies.push(CHUNKING_STRATEGY);
    strategies.push(CONTEXTUAL_LEARNING);
    strategies.push(WORKED_EXAMPLE);
  }

  if (questionType === 'debugging') {
    strategies.push(DEBUGGING_MINDSET);
    strategies.push(SOCRATIC_METHOD);
  }

  if (questionType === 'review') {
    strategies.push(ACTIVE_RECALL);
  }

  if (studentStruggles) {
    strategies.push(SOCRATIC_METHOD);
    strategies.push(CHUNKING_STRATEGY);
  }

  return strategies.join('\n\n');
}
