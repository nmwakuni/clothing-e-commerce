import Anthropic from '@anthropic-ai/sdk';

export interface CrisisDetectionResult {
  isCrisis: boolean;
  crisisType?: 'suicidal_ideation' | 'self_harm' | 'panic_attack' | 'severe_distress';
  severity: 'none' | 'mild' | 'moderate' | 'severe' | 'critical';
  confidence: number; // 0-100
  triggerPhrases: string[];
  immediateAction: string;
  recommendations: string[];
}

export interface CounselingResponse {
  message: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'crisis';
  topics: string[];
  recommendations: string[];
  crisisDetection: CrisisDetectionResult;
  followUpQuestions: string[];
}

export interface UserContext {
  userId: string;
  name?: string;
  age?: number;
  primaryConcerns?: string[];
  previousSessions?: number;
  riskLevel?: string;
  language?: string;
}

export interface CounselorConfig {
  anthropicApiKey: string;
  crisisHotlines: {
    country: string;
    number: string;
    name: string;
  }[];
}

export class AICounselorService {
  private anthropic: Anthropic;
  private crisisHotlines: Map<string, { number: string; name: string }>;

  constructor(config: CounselorConfig) {
    this.anthropic = new Anthropic({
      apiKey: config.anthropicApiKey,
    });

    this.crisisHotlines = new Map();
    config.crisisHotlines.forEach((hotline) => {
      this.crisisHotlines.set(hotline.country, {
        number: hotline.number,
        name: hotline.name,
      });
    });
  }

  /**
   * Detect crisis indicators in user message
   */
  async detectCrisis(message: string, context?: UserContext): Promise<CrisisDetectionResult> {
    const prompt = `You are a mental health crisis detection AI. Analyze this message for signs of crisis.

Message: "${message}"

${context?.riskLevel ? `User's current risk level: ${context.riskLevel}` : ''}
${context?.primaryConcerns ? `Known concerns: ${context.primaryConcerns.join(', ')}` : ''}

Analyze for:
1. Suicidal ideation (thoughts of death, suicide plans, hopelessness)
2. Self-harm intent
3. Panic attack symptoms
4. Severe emotional distress

Return ONLY a JSON object:
{
  "isCrisis": boolean,
  "crisisType": "suicidal_ideation"|"self_harm"|"panic_attack"|"severe_distress"|null,
  "severity": "none"|"mild"|"moderate"|"severe"|"critical",
  "confidence": 0-100,
  "triggerPhrases": ["phrase1", "phrase2"],
  "immediateAction": "What to do right now",
  "recommendations": ["rec1", "rec2"]
}

Be highly sensitive - err on the side of caution for safety.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.3, // Lower temperature for consistent crisis detection
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      const cleaned = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Crisis detection failed:', error);
      // Fail safe: assume crisis if we can't analyze
      return {
        isCrisis: true,
        severity: 'moderate',
        confidence: 50,
        triggerPhrases: [],
        immediateAction: 'Please contact a mental health professional or crisis hotline immediately',
        recommendations: ['Contact emergency services', 'Reach out to crisis hotline'],
      };
    }
  }

  /**
   * Provide therapeutic counseling response
   */
  async counsel(
    message: string,
    sessionHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    context?: UserContext
  ): Promise<CounselingResponse> {
    // First, check for crisis
    const crisisDetection = await this.detectCrisis(message, context);

    // If crisis, provide immediate support
    if (crisisDetection.isCrisis && crisisDetection.severity !== 'mild') {
      return this.handleCrisisResponse(message, crisisDetection, context);
    }

    // Regular therapeutic conversation
    const systemPrompt = this.buildTherapeuticPrompt(context);

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          ...sessionHistory.map((msg) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
          {
            role: 'user',
            content: message,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      // Analyze the therapeutic response
      const analysis = await this.analyzeResponse(message, content.text);

      return {
        message: content.text,
        ...analysis,
        crisisDetection,
      };
    } catch (error) {
      console.error('Counseling failed:', error);
      throw error;
    }
  }

  /**
   * Handle crisis response with immediate resources
   */
  private async handleCrisisResponse(
    message: string,
    crisis: CrisisDetectionResult,
    context?: UserContext
  ): Promise<CounselingResponse> {
    const country = context?.userId ? 'Kenya' : 'Kenya'; // Default to Kenya
    const hotline = this.crisisHotlines.get(country) || {
      number: '+254722178177',
      name: 'Kenya Crisis Hotline',
    };

    const crisisPrompt = `You are a crisis counselor. A person has expressed: "${message}"

This indicates ${crisis.crisisType} at ${crisis.severity} severity.

Provide:
1. Immediate empathetic validation
2. Safety assessment questions
3. Grounding techniques they can use RIGHT NOW
4. Clear next steps

Be warm, non-judgmental, and focus on immediate safety.
Keep response under 200 words.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 800,
      temperature: 0.5,
      messages: [{ role: 'user', content: crisisPrompt }],
    });

    const content = response.content[0];
    const counselorMessage = content.type === 'text' ? content.text : '';

    // Add crisis hotline info
    const fullMessage = `${counselorMessage}

🆘 **IMMEDIATE HELP AVAILABLE**

If you are in immediate danger or having thoughts of harming yourself, please:

📞 Call ${hotline.name}: ${hotline.number}
🚨 Call Emergency Services: 999
💬 Text "HELP" to get immediate support

You don't have to face this alone. Help is available right now.`;

    return {
      message: fullMessage,
      sentiment: 'crisis',
      topics: [crisis.crisisType || 'crisis'],
      recommendations: crisis.recommendations,
      crisisDetection: crisis,
      followUpQuestions: [
        'Are you currently safe?',
        'Is there someone with you right now?',
        'Can you call the crisis hotline together?',
      ],
    };
  }

  /**
   * Build therapeutic system prompt
   */
  private buildTherapeuticPrompt(context?: UserContext): string {
    return `You are Nafsi, an AI mental health counselor designed for African communities.

CORE PRINCIPLES:
- **Empathy First**: Validate feelings before offering solutions
- **Cultural Sensitivity**: Understand African family dynamics, stigma, spirituality
- **Evidence-Based**: Use CBT, mindfulness, solution-focused techniques
- **Safety**: Always prioritize user safety; detect crisis immediately
- **Boundaries**: Remind users you're AI, not replacement for professional help
- **Language**: Use simple, warm, conversational ${context?.language || 'English'}

${context?.name ? `User's name: ${context.name}` : 'User prefers anonymity'}
${context?.age ? `Age: ${context.age}` : ''}
${context?.primaryConcerns ? `Main concerns: ${context.primaryConcerns.join(', ')}` : ''}
${context?.previousSessions ? `Previous sessions: ${context.previousSessions}` : 'First session'}

THERAPEUTIC APPROACH:
1. **Listen actively**: Reflect, validate, explore
2. **Ask open questions**: Help them discover insights
3. **Teach coping skills**: Breathing, grounding, reframing
4. **Build hope**: Focus on strengths and small wins
5. **Cultural context**: Acknowledge family, community, faith when relevant

NEVER:
- Diagnose mental illness
- Prescribe medication
- Make promises you can't keep
- Ignore crisis signs
- Be judgmental

FORMAT:
- Keep responses to 2-3 short paragraphs
- Use emojis sparingly and appropriately
- End with an open question to continue conversation
- If user seems hesitant, normalize their feelings

Remember: You are a supportive companion on their mental health journey.`;
  }

  /**
   * Analyze response for sentiment and topics
   */
  private async analyzeResponse(userMessage: string, aiResponse: string) {
    const analysisPrompt = `Analyze this therapy conversation:

User: "${userMessage}"
AI: "${aiResponse}"

Return ONLY JSON:
{
  "sentiment": "positive"|"neutral"|"negative"|"crisis",
  "topics": ["topic1", "topic2"],
  "recommendations": ["action1", "action2"],
  "followUpQuestions": ["question1", "question2"]
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        temperature: 0.3,
        messages: [{ role: 'user', content: analysisPrompt }],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      const cleaned = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      // Fallback
      return {
        sentiment: 'neutral' as const,
        topics: ['general'],
        recommendations: [],
        followUpQuestions: [],
      };
    }
  }

  /**
   * Generate daily reflection prompts
   */
  async getDailyPrompt(context?: UserContext): Promise<string> {
    const prompts = [
      'What is one thing you\'re grateful for today? 🌟',
      'How are you really feeling right now? Take a moment to check in with yourself.',
      'What small act of self-care can you do today?',
      'What emotion have you been avoiding? It\'s okay to feel it.',
      'Who in your life makes you feel supported? Consider reaching out to them.',
      'What would you tell a friend going through what you\'re experiencing?',
      'What\'s one thing that brought you comfort or joy this week?',
    ];

    // Could personalize based on context
    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  /**
   * Suggest coping strategies
   */
  async getCopingStrategies(concern: string): Promise<string[]> {
    const strategiesMap: Record<string, string[]> = {
      anxiety: [
        '5-4-3-2-1 grounding: Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste',
        'Box breathing: Breathe in for 4, hold for 4, out for 4, hold for 4',
        'Progressive muscle relaxation: Tense and release each muscle group',
        'Call a trusted friend or family member',
        'Go for a short walk outside',
      ],
      depression: [
        'Start with one tiny task - even making your bed counts',
        'Get sunlight - sit by a window or step outside for 5 minutes',
        'Move your body gently - stretch, walk, dance to one song',
        'Reach out to one person, even just a text',
        'Do one thing you used to enjoy, even if you don\'t feel like it',
      ],
      stress: [
        'Write down what\'s stressing you - externalize it',
        'Take 3 deep breaths right now',
        'Do a 5-minute activity you enjoy',
        'Set one boundary today',
        'Ask for help with one thing',
      ],
    };

    return strategiesMap[concern.toLowerCase()] || strategiesMap.stress;
  }
}
