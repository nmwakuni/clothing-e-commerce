export * from './profile-optimizer';
export * from './outreach-generator';

import { ProfileOptimizer } from './profile-optimizer';
import { OutreachGenerator } from './outreach-generator';

export function createAIEngine(apiKey: string) {
  return {
    profileOptimizer: new ProfileOptimizer(apiKey),
    outreachGenerator: new OutreachGenerator(apiKey),
  };
}
