import Anthropic from '@anthropic-ai/sdk';

export interface ProfileData {
  currentHeadline?: string;
  currentAbout?: string;
  currentExperience?: Array<{
    title: string;
    company: string;
    description?: string;
    duration?: string;
  }>;
  industry?: string;
  targetRole?: string;
  skills?: string[];
}

export interface ProfileAudit {
  score: number; // 0-100
  feedback: {
    headline: {
      score: number;
      issues: string[];
      suggestions: string[];
    };
    about: {
      score: number;
      issues: string[];
      suggestions: string[];
    };
    experience: {
      score: number;
      issues: string[];
      suggestions: string[];
    };
    overall: {
      strengths: string[];
      weaknesses: string[];
      quickWins: string[];
    };
  };
}

export interface OptimizedProfile {
  headline: string;
  about: string;
  experience?: Array<{
    title: string;
    company: string;
    optimizedDescription: string;
  }>;
  suggestions: string[];
}

export class ProfileOptimizer {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async auditProfile(profileData: ProfileData): Promise<ProfileAudit> {
    const prompt = `You are a LinkedIn profile optimization expert. Audit this LinkedIn profile and provide a detailed assessment.

Profile Data:
${JSON.stringify(profileData, null, 2)}

Provide a comprehensive audit with:
1. Overall score (0-100)
2. Detailed feedback for headline, about section, and experience
3. Specific issues and suggestions for each section
4. Overall strengths, weaknesses, and quick wins

Return ONLY valid JSON in this exact format:
{
  "score": 75,
  "feedback": {
    "headline": {
      "score": 80,
      "issues": ["Too generic", "Doesn't show value proposition"],
      "suggestions": ["Add specific outcomes you deliver", "Include your niche"]
    },
    "about": {
      "score": 70,
      "issues": ["Reads like a resume", "No clear call-to-action"],
      "suggestions": ["Focus on client outcomes", "Add social proof"]
    },
    "experience": {
      "score": 75,
      "issues": ["Too focused on duties", "Missing metrics"],
      "suggestions": ["Add quantifiable achievements", "Use action verbs"]
    },
    "overall": {
      "strengths": ["Clear industry focus", "Good experience"],
      "weaknesses": ["Generic messaging", "No personality"],
      "quickWins": ["Update headline", "Add metrics to experience"]
    }
  }
}`;

    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    return JSON.parse(content.text);
  }

  async optimizeProfile(profileData: ProfileData): Promise<OptimizedProfile> {
    const prompt = `You are a LinkedIn profile optimization expert specializing in African professionals and businesses.

Current Profile:
${JSON.stringify(profileData, null, 2)}

Generate an optimized LinkedIn profile that:
1. Has a compelling headline that shows value (not just title)
2. Has an engaging About section focused on outcomes (not resume-style)
3. Has optimized experience descriptions with metrics and achievements
4. Is authentic and showcases personality
5. Includes a clear call-to-action

Context for African market:
- Emphasize global + local expertise
- Highlight problem-solving for African businesses if relevant
- Use language that resonates with both local and international audiences
- Include trust-building elements

Return ONLY valid JSON in this exact format:
{
  "headline": "I help African startups scale globally | Raised $50M+ for clients | Tech & Business Strategy",
  "about": "Most African startups fail not from lack of ideas, but from...[compelling story that leads to your solution and CTA]",
  "experience": [
    {
      "title": "Senior Software Engineer",
      "company": "TechCorp Africa",
      "optimizedDescription": "Led team of 5 engineers to build fintech platform serving 100K+ users across Kenya and Nigeria. Reduced transaction processing time by 60%, enabling $2M+ monthly GMV."
    }
  ],
  "suggestions": [
    "Add featured section with case studies",
    "Get 3-5 testimonials from clients",
    "Post 3x per week about industry insights"
  ]
}`;

    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    return JSON.parse(content.text);
  }
}
