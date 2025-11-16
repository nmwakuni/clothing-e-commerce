import Anthropic from '@anthropic-ai/sdk';

export interface ProspectData {
  name: string;
  company?: string;
  title?: string;
  industry?: string;
  linkedinUrl: string;
  recentPosts?: Array<{
    content: string;
    date: string;
  }>;
  aboutSection?: string;
  sharedConnections?: number;
}

export interface SenderContext {
  name: string;
  company?: string;
  title?: string;
  valueProposition: string; // What you help with
  industry?: string;
  targetAudience?: string;
}

export interface GeneratedOutreach {
  connectionRequest: string;
  followupSequence: {
    followup1: string; // Day 3-5
    followup2: string; // Day 7-10
    followup3: string; // Day 14
  };
  coldEmail: {
    subject: string;
    body: string;
  };
  personalizationUsed: string[]; // What data points were used for personalization
}

export class OutreachGenerator {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generateOutreach(
    prospect: ProspectData,
    sender: SenderContext
  ): Promise<GeneratedOutreach> {
    const prompt = `You are an expert B2B outreach specialist for African professionals. Generate personalized LinkedIn and email outreach.

PROSPECT:
${JSON.stringify(prospect, null, 2)}

SENDER:
${JSON.stringify(sender, null, 2)}

Generate highly personalized outreach messages that:
1. Reference specific details from their profile/posts
2. Show genuine interest (not salesy)
3. Provide value upfront
4. Have a low-commitment CTA
5. Feel human and authentic
6. Are culturally appropriate for African business context

RULES:
- Connection request: Max 200 characters
- Follow-ups: Build on previous messages, don't repeat
- Email: Professional but conversational
- NO generic templates - make it specific to THIS prospect
- Focus on THEIR challenges, not YOUR offerings initially

Return ONLY valid JSON in this exact format:
{
  "connectionRequest": "Hi {{name}}, I saw your post about {{topic}} - completely agree with your point on {{specific_insight}}. Would love to connect!",
  "followupSequence": {
    "followup1": "Thanks for connecting, {{name}}! I've been following {{company}}'s work in {{industry}}...",
    "followup2": "{{name}}, I came across this article on {{relevant_topic}} and thought of you...",
    "followup3": "{{name}}, I've helped companies like {{company}} solve {{problem}}. Would a quick 15-min call make sense?"
  },
  "coldEmail": {
    "subject": "{{specific_personalized_subject}}",
    "body": "Hi {{name}},\\n\\n{{personalized_opening}}\\n\\n{{value_proposition}}\\n\\n{{low_commitment_cta}}\\n\\nBest,\\n{{sender_name}}"
  },
  "personalizationUsed": [
    "Recent post about digital transformation",
    "Company expansion into Nigeria",
    "Title shows decision-making authority"
  ]
}`;

    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    return JSON.parse(content.text);
  }

  async analyzeProspect(profileData: any): Promise<{
    painPoints: string[];
    interests: string[];
    buyingSignals: string[];
    personalizationAngle: string;
  }> {
    const prompt = `You are an expert at analyzing LinkedIn profiles for B2B sales prospecting.

Profile Data:
${JSON.stringify(profileData, null, 2)}

Analyze this profile and identify:
1. Potential pain points or challenges they might be facing
2. Professional interests and priorities
3. Buying signals (signs they might be in-market for solutions)
4. Best personalization angle for outreach

Return ONLY valid JSON in this exact format:
{
  "painPoints": [
    "Scaling team rapidly - likely facing talent challenges",
    "Expanding to new markets - need local expertise"
  ],
  "interests": [
    "Fintech innovation",
    "African market expansion",
    "Team building"
  ],
  "buyingSignals": [
    "Just raised Series A - has budget",
    "Posted about hiring challenges - active pain point",
    "Engaging with competitor content"
  ],
  "personalizationAngle": "Reference their recent Series A and offer insights on scaling teams in African markets"
}`;

    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    return JSON.parse(content.text);
  }
}
