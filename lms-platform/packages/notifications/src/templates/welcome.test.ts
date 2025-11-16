import { describe, it, expect } from 'vitest';
import { generateWelcomeEmail } from './welcome';

describe('generateWelcomeEmail', () => {
  it('should generate welcome email HTML', () => {
    const html = generateWelcomeEmail({
      userName: 'John Kamau',
      loginUrl: 'https://skillhub.co.ke/login',
    });

    expect(html).toContain('John Kamau');
    expect(html).toContain('https://skillhub.co.ke/login');
    expect(html).toContain('Welcome to SkillHub Africa');
    expect(html).toContain('<!DOCTYPE html>');
  });

  it('should include all required sections', () => {
    const html = generateWelcomeEmail({
      userName: 'Test User',
      loginUrl: 'https://test.com',
    });

    expect(html).toContain('Browse our course catalog');
    expect(html).toContain('Start Learning Now');
    expect(html).toContain('Built with ❤️');
  });
});
