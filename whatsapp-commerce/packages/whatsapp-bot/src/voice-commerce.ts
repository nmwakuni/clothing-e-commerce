/**
 * Voice Commerce - Order via Voice Notes
 * Transcribes audio using OpenAI Whisper and processes orders
 */

export interface VoiceOrderRequest {
  audioUrl: string;
  phoneNumber: string;
  customerId: string;
}

export interface VoiceOrderResponse {
  transcript: string;
  intent: 'search' | 'order' | 'track' | 'help' | 'unknown';
  extractedData: {
    product?: string;
    quantity?: number;
    priceRange?: { min?: number; max?: number };
  };
  response: string;
}

export class VoiceCommerceService {
  private openaiApiKey: string;

  constructor(openaiApiKey: string) {
    this.openaiApiKey = openaiApiKey;
  }

  /**
   * Transcribe audio using OpenAI Whisper API
   */
  async transcribeAudio(audioUrl: string): Promise<string> {
    try {
      // Download audio file
      const audioResponse = await fetch(audioUrl);
      const audioBlob = await audioResponse.blob();

      // Convert to FormData
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.ogg');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en'); // Can detect automatically

      // Call Whisper API
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('Audio transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  /**
   * Process voice order
   */
  async processVoiceOrder(request: VoiceOrderRequest): Promise<VoiceOrderResponse> {
    // Transcribe audio
    const transcript = await this.transcribeAudio(request.audioUrl);

    // Parse intent from transcript
    const intent = this.detectIntent(transcript);

    // Extract product/order data
    const extractedData = this.extractOrderData(transcript);

    // Generate response
    const response = this.generateResponse(transcript, intent, extractedData);

    return {
      transcript,
      intent,
      extractedData,
      response,
    };
  }

  /**
   * Detect intent from transcript
   */
  private detectIntent(transcript: string): VoiceOrderResponse['intent'] {
    const lower = transcript.toLowerCase();

    // Search intent
    if (
      lower.includes('show') ||
      lower.includes('find') ||
      lower.includes('search') ||
      lower.includes('looking for')
    ) {
      return 'search';
    }

    // Order intent
    if (
      lower.includes('buy') ||
      lower.includes('order') ||
      lower.includes('purchase') ||
      lower.includes('i want')
    ) {
      return 'order';
    }

    // Track intent
    if (
      lower.includes('track') ||
      lower.includes('where is') ||
      lower.includes('order status')
    ) {
      return 'track';
    }

    // Help intent
    if (lower.includes('help') || lower.includes('how')) {
      return 'help';
    }

    return 'unknown';
  }

  /**
   * Extract order data from transcript
   */
  private extractOrderData(transcript: string): VoiceOrderResponse['extractedData'] {
    const data: VoiceOrderResponse['extractedData'] = {};

    // Extract quantity
    const quantityMatch = transcript.match(/(\d+)\s*(pieces?|items?|units?)?/i);
    if (quantityMatch) {
      data.quantity = parseInt(quantityMatch[1]);
    }

    // Extract price range
    const priceMatch = transcript.match(/(?:under|below|less than)\s*(\d+)/i);
    if (priceMatch) {
      data.priceRange = { max: parseInt(priceMatch[1]) };
    }

    // Product is the remaining text (simplified)
    data.product = transcript;

    return data;
  }

  /**
   * Generate response message
   */
  private generateResponse(
    transcript: string,
    intent: string,
    data: VoiceOrderResponse['extractedData']
  ): string {
    switch (intent) {
      case 'search':
        return `I heard you're looking for "${data.product}". Let me search for that! 🔍`;

      case 'order':
        return `Great! I'll help you order ${data.quantity || 1} ${data.product}. Let me find the best options! 🛒`;

      case 'track':
        return `I'll check the status of your orders. One moment... 📦`;

      case 'help':
        return `I'm here to help! You can tell me what you want to buy via voice note, and I'll find it for you! 😊`;

      default:
        return `I heard: "${transcript}". How can I help you shop today? Try saying "Show me phones" or "I want to buy rice"`;
    }
  }

  /**
   * Generate voice response (text-to-speech) - Future feature
   */
  async generateVoiceResponse(text: string): Promise<Blob> {
    // Use OpenAI TTS or Google TTS
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: 'alloy', // or 'echo', 'fable', 'onyx', 'nova', 'shimmer'
      }),
    });

    return await response.blob();
  }
}
