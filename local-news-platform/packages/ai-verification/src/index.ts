import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

export interface VerificationResult {
  isVerified: boolean;
  credibilityScore: number; // 0-100
  fakeNewsScore: number; // 0-100 (higher = more likely fake)
  toxicityScore: number; // 0-100
  flags: string[];
  analysis: {
    factualAccuracy: string;
    sourceCredibility: string;
    languageAnalysis: string;
    recommendations: string[];
  };
  decision: 'approve' | 'reject' | 'flag_review';
  confidence: number; // 0-100
}

export interface ContentToVerify {
  title: string;
  content: string;
  authorType?: 'ai' | 'journalist' | 'admin' | 'business';
  sourceUrl?: string;
  category?: string;
  images?: string[];
}

export interface AIVerificationConfig {
  anthropicApiKey?: string;
  openaiApiKey?: string;
  provider: 'claude' | 'openai' | 'both';
  strictMode?: boolean; // If true, require higher confidence for approval
}

export class AIVerificationService {
  private anthropic?: Anthropic;
  private openai?: OpenAI;
  private config: AIVerificationConfig;

  constructor(config: AIVerificationConfig) {
    this.config = config;

    if (config.anthropicApiKey) {
      this.anthropic = new Anthropic({
        apiKey: config.anthropicApiKey,
      });
    }

    if (config.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: config.openaiApiKey,
      });
    }

    if (!this.anthropic && !this.openai) {
      throw new Error('At least one AI provider API key must be provided');
    }
  }

  /**
   * Verify news content for fake news, credibility, and toxicity
   */
  async verifyContent(content: ContentToVerify): Promise<VerificationResult> {
    if (this.config.provider === 'both' && this.anthropic && this.openai) {
      // Use both providers and combine results
      const [claudeResult, openaiResult] = await Promise.all([
        this.verifyWithClaude(content),
        this.verifyWithOpenAI(content),
      ]);
      return this.combineVerificationResults(claudeResult, openaiResult);
    } else if (this.config.provider === 'claude' || (this.anthropic && !this.openai)) {
      return this.verifyWithClaude(content);
    } else {
      return this.verifyWithOpenAI(content);
    }
  }

  /**
   * Verify using Claude
   */
  private async verifyWithClaude(content: ContentToVerify): Promise<VerificationResult> {
    if (!this.anthropic) {
      throw new Error('Claude API not initialized');
    }

    const prompt = this.buildVerificationPrompt(content);

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.3, // Lower temperature for more consistent analysis
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const responseContent = message.content[0];
      if (responseContent.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      return this.parseVerificationResponse(responseContent.text);
    } catch (error) {
      console.error('Claude verification failed:', error);
      throw error;
    }
  }

  /**
   * Verify using OpenAI
   */
  private async verifyWithOpenAI(content: ContentToVerify): Promise<VerificationResult> {
    if (!this.openai) {
      throw new Error('OpenAI API not initialized');
    }

    const prompt = this.buildVerificationPrompt(content);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert fact-checker and content moderator for a hyperlocal news platform in Africa.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const responseText = response.choices[0]?.message?.content || '';
      return this.parseVerificationResponse(responseText);
    } catch (error) {
      console.error('OpenAI verification failed:', error);
      throw error;
    }
  }

  private buildVerificationPrompt(content: ContentToVerify): string {
    return `You are a fact-checking AI for Mtaa News, a hyperlocal news platform in Kenya.

Analyze this ${content.authorType || 'user'}-submitted news article for credibility and safety:

TITLE: ${content.title}

CONTENT:
${content.content}

${content.sourceUrl ? `SOURCE URL: ${content.sourceUrl}` : ''}
${content.category ? `CATEGORY: ${content.category}` : ''}

ANALYSIS CRITERIA:
1. **Factual Accuracy**: Are claims verifiable? Any red flags?
2. **Source Credibility**: Is the source reliable? Any URL indicators?
3. **Fake News Indicators**: Clickbait? Misleading? Sensationalism?
4. **Toxicity**: Hate speech? Inflammatory language? Harmful content?
5. **Local Context**: Does it make sense for a Kenyan/Nairobi audience?

SCORING GUIDE:
- Credibility Score (0-100): Overall trustworthiness
- Fake News Score (0-100): Likelihood of being misinformation (higher = worse)
- Toxicity Score (0-100): Harmful/offensive content level (higher = worse)

DECISION CRITERIA:
- APPROVE: High credibility (>70), low fake news (<30), low toxicity (<30)
- FLAG_REVIEW: Medium scores or uncertainty
- REJECT: Low credibility (<50) OR high fake news (>60) OR high toxicity (>60)

${this.config.strictMode ? 'USE STRICT MODE: Require higher standards for approval (credibility >80, fake news <20)' : ''}

RESPONSE FORMAT (JSON):
{
  "credibilityScore": 0-100,
  "fakeNewsScore": 0-100,
  "toxicityScore": 0-100,
  "flags": ["flag1", "flag2"],
  "analysis": {
    "factualAccuracy": "Detailed assessment",
    "sourceCredibility": "Source analysis",
    "languageAnalysis": "Tone and language assessment",
    "recommendations": ["recommendation1", "recommendation2"]
  },
  "decision": "approve|reject|flag_review",
  "confidence": 0-100,
  "reasoning": "Brief explanation of decision"
}`;
  }

  private parseVerificationResponse(response: string): VerificationResult {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      const parsed = JSON.parse(cleaned);

      return {
        isVerified: parsed.decision === 'approve',
        credibilityScore: parsed.credibilityScore || 0,
        fakeNewsScore: parsed.fakeNewsScore || 0,
        toxicityScore: parsed.toxicityScore || 0,
        flags: parsed.flags || [],
        analysis: {
          factualAccuracy: parsed.analysis?.factualAccuracy || '',
          sourceCredibility: parsed.analysis?.sourceCredibility || '',
          languageAnalysis: parsed.analysis?.languageAnalysis || '',
          recommendations: parsed.analysis?.recommendations || [],
        },
        decision: parsed.decision || 'flag_review',
        confidence: parsed.confidence || 0,
      };
    } catch (error) {
      console.error('Failed to parse verification response:', error);
      // Return safe defaults (reject with low confidence)
      return {
        isVerified: false,
        credibilityScore: 0,
        fakeNewsScore: 100,
        toxicityScore: 0,
        flags: ['parsing_error'],
        analysis: {
          factualAccuracy: 'Unable to analyze',
          sourceCredibility: 'Unable to analyze',
          languageAnalysis: 'Unable to analyze',
          recommendations: ['Manual review required'],
        },
        decision: 'flag_review',
        confidence: 0,
      };
    }
  }

  /**
   * Combine results from both Claude and OpenAI
   */
  private combineVerificationResults(
    claude: VerificationResult,
    openai: VerificationResult
  ): VerificationResult {
    // Average the scores
    const credibilityScore = Math.round((claude.credibilityScore + openai.credibilityScore) / 2);
    const fakeNewsScore = Math.round((claude.fakeNewsScore + openai.fakeNewsScore) / 2);
    const toxicityScore = Math.round((claude.toxicityScore + openai.toxicityScore) / 2);

    // Combine flags (unique)
    const flags = Array.from(new Set([...claude.flags, ...openai.flags]));

    // Use more conservative decision (if either rejects, reject)
    let decision: 'approve' | 'reject' | 'flag_review' = 'approve';
    if (claude.decision === 'reject' || openai.decision === 'reject') {
      decision = 'reject';
    } else if (claude.decision === 'flag_review' || openai.decision === 'flag_review') {
      decision = 'flag_review';
    }

    return {
      isVerified: decision === 'approve',
      credibilityScore,
      fakeNewsScore,
      toxicityScore,
      flags,
      analysis: {
        factualAccuracy: `Claude: ${claude.analysis.factualAccuracy}\n\nOpenAI: ${openai.analysis.factualAccuracy}`,
        sourceCredibility: `Claude: ${claude.analysis.sourceCredibility}\n\nOpenAI: ${openai.analysis.sourceCredibility}`,
        languageAnalysis: `Claude: ${claude.analysis.languageAnalysis}\n\nOpenAI: ${openai.analysis.languageAnalysis}`,
        recommendations: Array.from(
          new Set([...claude.analysis.recommendations, ...openai.analysis.recommendations])
        ),
      },
      decision,
      confidence: Math.round((claude.confidence + openai.confidence) / 2),
    };
  }

  /**
   * Quick check for obviously inappropriate content
   */
  async quickModeration(text: string): Promise<{ safe: boolean; categories: string[] }> {
    if (this.openai) {
      try {
        const moderation = await this.openai.moderations.create({
          input: text,
        });

        const result = moderation.results[0];
        const flaggedCategories = Object.entries(result.categories)
          .filter(([_, flagged]) => flagged)
          .map(([category]) => category);

        return {
          safe: !result.flagged,
          categories: flaggedCategories,
        };
      } catch (error) {
        console.error('OpenAI moderation failed:', error);
      }
    }

    // Fallback: simple keyword check
    const inappropriateKeywords = [
      'hate',
      'violence',
      'explicit',
      'illegal',
      // Add more as needed
    ];

    const lowerText = text.toLowerCase();
    const foundKeywords = inappropriateKeywords.filter((keyword) =>
      lowerText.includes(keyword)
    );

    return {
      safe: foundKeywords.length === 0,
      categories: foundKeywords,
    };
  }

  /**
   * Check if an image contains inappropriate content
   */
  async verifyImage(imageUrl: string): Promise<{ safe: boolean; labels: string[] }> {
    // This would integrate with a vision API (e.g., Google Vision, AWS Rekognition)
    // For now, return a placeholder
    console.log('Image verification not implemented yet:', imageUrl);
    return {
      safe: true,
      labels: [],
    };
  }
}
