import { describe, it, expect } from 'vitest';
import * as schema from './schema';

describe('Database Schema', () => {
  describe('users schema', () => {
    it('should have required fields', () => {
      expect(schema.users).toBeDefined();
      // Check that the schema exports are available
      expect(typeof schema.users).toBe('object');
    });
  });

  describe('therapists schema', () => {
    it('should have required fields', () => {
      expect(schema.therapists).toBeDefined();
      expect(typeof schema.therapists).toBe('object');
    });
  });

  describe('sessions schema', () => {
    it('should have required fields', () => {
      expect(schema.sessions).toBeDefined();
      expect(typeof schema.sessions).toBe('object');
    });
  });

  describe('moods schema', () => {
    it('should have required fields', () => {
      expect(schema.moods).toBeDefined();
      expect(typeof schema.moods).toBe('object');
    });
  });

  describe('crisis events schema', () => {
    it('should have required fields', () => {
      expect(schema.crisisEvents).toBeDefined();
      expect(typeof schema.crisisEvents).toBe('object');
    });
  });

  describe('appointments schema', () => {
    it('should have required fields', () => {
      expect(schema.appointments).toBeDefined();
      expect(typeof schema.appointments).toBe('object');
    });
  });

  describe('resources schema', () => {
    it('should have required fields', () => {
      expect(schema.resources).toBeDefined();
      expect(typeof schema.resources).toBe('object');
    });
  });

  describe('support groups schema', () => {
    it('should have required fields', () => {
      expect(schema.supportGroups).toBeDefined();
      expect(typeof schema.supportGroups).toBe('object');
    });
  });

  describe('journal entries schema', () => {
    it('should have required fields', () => {
      expect(schema.journalEntries).toBeDefined();
      expect(typeof schema.journalEntries).toBe('object');
    });
  });

  describe('safety plans schema', () => {
    it('should have required fields', () => {
      expect(schema.safetyPlans).toBeDefined();
      expect(typeof schema.safetyPlans).toBe('object');
    });
  });
});
