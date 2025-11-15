import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { nanoid } from 'nanoid';
import { z } from 'zod';

/**
 * Authentication Service for LMS Platform
 *
 * Phone-based authentication (perfect for WhatsApp)
 * Magic link login
 * JWT token management
 */

export interface AuthConfig {
  jwtSecret: string;
  tokenExpiry?: string; // e.g., '7d', '30d'
  magicLinkExpiry?: number; // minutes, default 15
}

export interface UserPayload extends JWTPayload {
  userId: string;
  phoneNumber: string;
  email?: string;
  role?: string;
}

export interface MagicLink {
  token: string;
  expiresAt: Date;
  phoneNumber: string;
}

export interface AuthSession {
  user: {
    id: string;
    phoneNumber: string;
    email?: string;
    fullName?: string;
    role?: string;
    subscriptionTier?: string;
  };
  token: string;
  expiresAt: Date;
}

/**
 * Auth Service
 */
export class AuthService {
  private config: AuthConfig;
  private secret: Uint8Array;
  private magicLinks: Map<string, MagicLink> = new Map();

  constructor(config: AuthConfig) {
    this.config = config;
    this.secret = new TextEncoder().encode(config.jwtSecret);
  }

  /**
   * Format phone number to E.164 format (for Kenya)
   */
  formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // If starts with 0, replace with 254
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.slice(1);
    }

    // If starts with 7 or 1 (missing country code), add 254
    if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      cleaned = '254' + cleaned;
    }

    // Add + prefix
    return '+' + cleaned;
  }

  /**
   * Validate phone number
   */
  validatePhoneNumber(phone: string): boolean {
    const formatted = this.formatPhoneNumber(phone);
    // Kenya numbers: +254 7XX XXX XXX or +254 1XX XXX XXX
    return /^\+254[71]\d{8}$/.test(formatted);
  }

  /**
   * Generate magic link token
   */
  async generateMagicLink(phoneNumber: string): Promise<{
    token: string;
    link: string;
    expiresAt: Date;
  }> {
    const formatted = this.formatPhoneNumber(phoneNumber);

    if (!this.validatePhoneNumber(formatted)) {
      throw new Error('Invalid phone number');
    }

    const token = nanoid(32);
    const expiresAt = new Date(
      Date.now() + (this.config.magicLinkExpiry || 15) * 60 * 1000
    );

    // Store magic link (in production, store in Redis or database)
    this.magicLinks.set(token, {
      token,
      phoneNumber: formatted,
      expiresAt,
    });

    // Clean up expired links
    this.cleanExpiredMagicLinks();

    const link = `https://app.skillhub.co.ke/auth/verify?token=${token}`;

    return {
      token,
      link,
      expiresAt,
    };
  }

  /**
   * Verify magic link token
   */
  async verifyMagicLink(token: string): Promise<string | null> {
    const magicLink = this.magicLinks.get(token);

    if (!magicLink) {
      return null;
    }

    if (new Date() > magicLink.expiresAt) {
      this.magicLinks.delete(token);
      return null;
    }

    // Delete token after use (one-time use)
    this.magicLinks.delete(token);

    return magicLink.phoneNumber;
  }

  /**
   * Clean up expired magic links
   */
  private cleanExpiredMagicLinks() {
    const now = new Date();
    for (const [token, link] of this.magicLinks.entries()) {
      if (now > link.expiresAt) {
        this.magicLinks.delete(token);
      }
    }
  }

  /**
   * Create JWT token
   */
  async createToken(payload: UserPayload): Promise<string> {
    const expiry = this.config.tokenExpiry || '7d';

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expiry)
      .sign(this.secret);

    return token;
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<UserPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.secret);
      return payload as UserPayload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  /**
   * Decode token without verification (for expired tokens, etc.)
   */
  decodeToken(token: string): UserPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64').toString('utf-8')
      );
      return payload as UserPayload;
    } catch {
      return null;
    }
  }

  /**
   * Create session from user data
   */
  async createSession(user: {
    id: string;
    phoneNumber: string;
    email?: string;
    fullName?: string;
    role?: string;
    subscriptionTier?: string;
  }): Promise<AuthSession> {
    const payload: UserPayload = {
      userId: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
    };

    const token = await this.createToken(payload);
    const decoded = this.decodeToken(token);

    if (!decoded || !decoded.exp) {
      throw new Error('Failed to create session');
    }

    return {
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
      },
      token,
      expiresAt: new Date(decoded.exp * 1000),
    };
  }

  /**
   * Refresh session (extend expiry)
   */
  async refreshSession(token: string): Promise<AuthSession | null> {
    const payload = await this.verifyToken(token);

    if (!payload) {
      return null;
    }

    // Create new token with extended expiry
    const newToken = await this.createToken(payload);
    const decoded = this.decodeToken(newToken);

    if (!decoded || !decoded.exp) {
      return null;
    }

    return {
      user: {
        id: payload.userId,
        phoneNumber: payload.phoneNumber,
        email: payload.email,
        role: payload.role,
      },
      token: newToken,
      expiresAt: new Date(decoded.exp * 1000),
    };
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(header: string): string | null {
    const match = header.match(/^Bearer (.+)$/);
    return match ? match[1] : null;
  }
}

// Helper to create auth service
export function createAuthService(config: AuthConfig): AuthService {
  return new AuthService(config);
}

// Export types
export type {
  AuthConfig,
  UserPayload,
  MagicLink,
  AuthSession,
};
