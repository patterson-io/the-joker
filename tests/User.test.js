import { jest } from '@jest/globals';
import { User } from '../src/models/User.js';

/**
 * Test suite for User model
 * Tests user management, preferences, and gamification features
 */
describe('User', () => {
  let user;
  const userId = 'test-user-123';

  beforeEach(() => {
    user = new User(userId, {
      categories: ['science', 'technology'],
      excludeCategories: ['marriage'],
      safetyLevel: 'family-friendly'
    });
  });

  describe('constructor', () => {
    it('should create user with default preferences', () => {
      const defaultUser = new User('default-user');
      
      expect(defaultUser.id).toBe('default-user');
      expect(defaultUser.preferences.categories).toEqual([]);
      expect(defaultUser.preferences.excludeCategories).toEqual([]);
      expect(defaultUser.preferences.safetyLevel).toBe('family-friendly');
      expect(defaultUser.stats.jokesViewed).toBe(0);
      expect(defaultUser.stats.favoriteJokes).toEqual([]);
      expect(defaultUser.stats.dailyStreak).toBe(0);
      expect(defaultUser.stats.achievements).toEqual([]);
    });

    it('should create user with custom preferences', () => {
      expect(user.id).toBe(userId);
      expect(user.preferences.categories).toEqual(['science', 'technology']);
      expect(user.preferences.excludeCategories).toEqual(['marriage']);
      expect(user.preferences.safetyLevel).toBe('family-friendly');
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should merge custom preferences with defaults', () => {
      const partialUser = new User('partial-user', {
        categories: ['food']
      });
      
      expect(partialUser.preferences.categories).toEqual(['food']);
      expect(partialUser.preferences.excludeCategories).toEqual([]);
      expect(partialUser.preferences.safetyLevel).toBe('family-friendly');
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences', async () => {
      const newPreferences = {
        categories: ['food', 'career'],
        safetyLevel: 'all-audiences'
      };

      await user.updatePreferences(newPreferences);
      
      expect(user.preferences.categories).toEqual(['food', 'career']);
      expect(user.preferences.safetyLevel).toBe('all-audiences');
      // Should preserve existing preferences not being updated
      expect(user.preferences.excludeCategories).toEqual(['marriage']);
    });

    it('should handle partial preference updates', async () => {
      await user.updatePreferences({ categories: ['updated'] });
      
      expect(user.preferences.categories).toEqual(['updated']);
      expect(user.preferences.excludeCategories).toEqual(['marriage']);
      expect(user.preferences.safetyLevel).toBe('family-friendly');
    });

    it('should handle empty preference updates', async () => {
      const originalPreferences = { ...user.preferences };
      await user.updatePreferences({});
      
      expect(user.preferences).toEqual(originalPreferences);
    });
  });

  describe('favorite management', () => {
    describe('addFavorite', () => {
      it('should add joke to favorites', async () => {
        const result = await user.addFavorite(123);
        
        expect(result).toBe(true);
        expect(user.stats.favoriteJokes).toContain(123);
      });

      it('should not add duplicate favorites', async () => {
        await user.addFavorite(123);
        const result = await user.addFavorite(123);
        
        expect(result).toBe(false);
        expect(user.stats.favoriteJokes).toEqual([123]);
      });

      it('should handle multiple favorites', async () => {
        await user.addFavorite(1);
        await user.addFavorite(2);
        await user.addFavorite(3);
        
        expect(user.stats.favoriteJokes).toEqual([1, 2, 3]);
      });
    });

    describe('removeFavorite', () => {
      beforeEach(async () => {
        await user.addFavorite(1);
        await user.addFavorite(2);
        await user.addFavorite(3);
      });

      it('should remove joke from favorites', async () => {
        const result = await user.removeFavorite(2);
        
        expect(result).toBe(true);
        expect(user.stats.favoriteJokes).toEqual([1, 3]);
      });

      it('should return false for non-existent favorite', async () => {
        const result = await user.removeFavorite(999);
        
        expect(result).toBe(false);
        expect(user.stats.favoriteJokes).toEqual([1, 2, 3]);
      });

      it('should handle removing from empty favorites', async () => {
        const emptyUser = new User('empty-user');
        const result = await emptyUser.removeFavorite(1);
        
        expect(result).toBe(false);
        expect(emptyUser.stats.favoriteJokes).toEqual([]);
      });
    });
  });

  describe('streak management', () => {
    it('should start streak on first visit', async () => {
      const streak = await user.updateStreak();
      
      expect(streak).toBe(1);
      expect(user.stats.dailyStreak).toBe(1);
      expect(user.stats.lastVisit).toBeInstanceOf(Date);
    });

    it('should maintain streak on consecutive days', async () => {
      // Simulate yesterday's visit
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      user.stats.lastVisit = yesterday;
      user.stats.dailyStreak = 5;

      const streak = await user.updateStreak();
      
      expect(streak).toBe(6);
      expect(user.stats.dailyStreak).toBe(6);
    });

    it('should reset streak after missing a day', async () => {
      // Simulate visit from 2 days ago
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      user.stats.lastVisit = twoDaysAgo;
      user.stats.dailyStreak = 10;

      const streak = await user.updateStreak();
      
      expect(streak).toBe(1);
      expect(user.stats.dailyStreak).toBe(1);
    });

    it('should not change streak on same day visit', async () => {
      // Set today's visit
      user.stats.lastVisit = new Date();
      user.stats.dailyStreak = 7;

      const streak = await user.updateStreak();
      
      expect(streak).toBe(7);
      expect(user.stats.dailyStreak).toBe(7);
    });

    it('should handle edge case of midnight visits', async () => {
      // Simulate just before midnight yesterday
      const almostMidnight = new Date();
      almostMidnight.setDate(almostMidnight.getDate() - 1);
      almostMidnight.setHours(23, 59, 59, 999);
      
      user.stats.lastVisit = almostMidnight;
      user.stats.dailyStreak = 3;

      const streak = await user.updateStreak();
      
      expect(streak).toBe(4);
    });
  });

  describe('achievement management', () => {
    it('should add new achievement', async () => {
      const result = await user.addAchievement('first_joke');
      
      expect(result).toBe(true);
      expect(user.stats.achievements).toContain('first_joke');
    });

    it('should not add duplicate achievements', async () => {
      await user.addAchievement('first_joke');
      const result = await user.addAchievement('first_joke');
      
      expect(result).toBe(false);
      expect(user.stats.achievements).toEqual(['first_joke']);
    });

    it('should handle multiple achievements', async () => {
      await user.addAchievement('first_joke');
      await user.addAchievement('week_warrior');
      await user.addAchievement('joke_master');
      
      expect(user.stats.achievements).toEqual(['first_joke', 'week_warrior', 'joke_master']);
    });
  });

  describe('category scoring', () => {
    it('should return high score for preferred categories', () => {
      const score = user.getCategoryScore('science');
      expect(score).toBe(1);
    });

    it('should return zero score for excluded categories', () => {
      const score = user.getCategoryScore('marriage');
      expect(score).toBe(0);
    });

    it('should return neutral score for unlisted categories', () => {
      const score = user.getCategoryScore('food');
      expect(score).toBe(0.5);
    });

    it('should handle empty preferences', () => {
      const neutralUser = new User('neutral-user');
      
      expect(neutralUser.getCategoryScore('science')).toBe(0.5);
      expect(neutralUser.getCategoryScore('food')).toBe(0.5);
      expect(neutralUser.getCategoryScore('career')).toBe(0.5);
    });
  });

  describe('serialization', () => {
    beforeEach(async () => {
      // Set up user with some data
      await user.addFavorite(1);
      await user.addFavorite(2);
      await user.addAchievement('test_achievement');
      await user.updateStreak();
      user.stats.jokesViewed = 10;
    });

    describe('toJSON', () => {
      it('should serialize user data', () => {
        const json = user.toJSON();
        
        expect(json.id).toBe(userId);
        expect(json.preferences).toEqual(user.preferences);
        expect(json.stats).toEqual(user.stats);
        expect(json.createdAt).toBe(user.createdAt);
      });

      it('should create serializable object', () => {
        const json = user.toJSON();
        const jsonString = JSON.stringify(json);
        
        expect(() => JSON.parse(jsonString)).not.toThrow();
      });
    });

    describe('fromJSON', () => {
      it('should deserialize user data', () => {
        const json = user.toJSON();
        const deserializedUser = User.fromJSON(json);
        
        expect(deserializedUser.id).toBe(user.id);
        expect(deserializedUser.preferences).toEqual(user.preferences);
        expect(deserializedUser.stats).toEqual(user.stats);
        expect(deserializedUser.createdAt).toEqual(user.createdAt);
      });

      it('should handle full serialization cycle', () => {
        const json = user.toJSON();
        const jsonString = JSON.stringify(json);
        const parsedJson = JSON.parse(jsonString);
        const deserializedUser = User.fromJSON(parsedJson);
        
        expect(deserializedUser.id).toBe(user.id);
        expect(deserializedUser.preferences.categories).toEqual(user.preferences.categories);
        expect(deserializedUser.stats.favoriteJokes).toEqual(user.stats.favoriteJokes);
        expect(deserializedUser.stats.achievements).toEqual(user.stats.achievements);
      });

      it('should preserve methods after deserialization', async () => {
        const json = user.toJSON();
        const deserializedUser = User.fromJSON(json);
        
        // Test that methods still work
        const result = await deserializedUser.addFavorite(999);
        expect(result).toBe(true);
        expect(deserializedUser.stats.favoriteJokes).toContain(999);
      });
    });
  });

  describe('error handling', () => {
    it('should handle favorite operations errors gracefully', async () => {
      // Mock an error in the favorite system
      const originalPush = Array.prototype.push;
      Array.prototype.push = jest.fn().mockImplementation(() => {
        throw new Error('Array operation failed');
      });

      await expect(user.addFavorite(123)).rejects.toThrow('Failed to add favorite: Array operation failed');
      
      // Restore original method
      Array.prototype.push = originalPush;
    });

    it('should handle streak update errors gracefully', async () => {
      // Mock Date constructor to throw error
      const originalDate = global.Date;
      global.Date = jest.fn().mockImplementation(() => {
        throw new Error('Date creation failed');
      });

      await expect(user.updateStreak()).rejects.toThrow('Failed to update streak: Date creation failed');
      
      // Restore original Date
      global.Date = originalDate;
    });

    it('should handle achievement errors gracefully', async () => {
      // Mock array includes to throw error
      const originalIncludes = Array.prototype.includes;
      Array.prototype.includes = jest.fn().mockImplementation(() => {
        throw new Error('Includes operation failed');
      });

      await expect(user.addAchievement('test')).rejects.toThrow('Failed to add achievement: Includes operation failed');
      
      // Restore original method
      Array.prototype.includes = originalIncludes;
    });

    it('should handle preference update errors gracefully', async () => {
      // Create a user that will fail on preference updates
      const problematicUser = new User('problem-user');
      
      // Mock the spread operator by making preferences non-extensible
      Object.preventExtensions(problematicUser.preferences);
      
      // This should not throw, as the current implementation uses object spread which creates a new object
      await expect(problematicUser.updatePreferences({ test: 'value' })).resolves.not.toThrow();
    });
  });

  describe('async behavior', () => {
    it('should handle concurrent favorite operations', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => 
        user.addFavorite(i)
      );

      const results = await Promise.all(promises);
      
      expect(results.every(result => result === true)).toBe(true);
      expect(user.stats.favoriteJokes).toHaveLength(10);
      expect(user.stats.favoriteJokes).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should handle concurrent achievement operations', async () => {
      const promises = Array.from({ length: 5 }, (_, i) => 
        user.addAchievement(`achievement_${i}`)
      );

      const results = await Promise.all(promises);
      
      expect(results.every(result => result === true)).toBe(true);
      expect(user.stats.achievements).toHaveLength(5);
    });

    it('should handle concurrent streak updates', async () => {
      const promises = Array.from({ length: 3 }, () => 
        user.updateStreak()
      );

      const results = await Promise.all(promises);
      
      // All should return the same streak value since they're on the same day
      expect(results[0]).toBe(results[1]);
      expect(results[1]).toBe(results[2]);
    });
  });

  describe('edge cases', () => {
    it('should handle invalid user ID', () => {
      const userWithEmptyId = new User('');
      expect(userWithEmptyId.id).toBe('');
    });

    it('should handle null preferences', () => {
      const userWithNullPrefs = new User('test', null);
      expect(userWithNullPrefs.preferences.categories).toEqual([]);
    });

    it('should handle undefined preferences', () => {
      const userWithUndefinedPrefs = new User('test', undefined);
      expect(userWithUndefinedPrefs.preferences.categories).toEqual([]);
    });

    it('should handle large numbers of favorites', async () => {
      const largeNumbers = Array.from({ length: 1000 }, (_, i) => i);
      
      for (const num of largeNumbers) {
        await user.addFavorite(num);
      }
      
      expect(user.stats.favoriteJokes).toHaveLength(1000);
      
      // Test removal from large list
      const result = await user.removeFavorite(500);
      expect(result).toBe(true);
      expect(user.stats.favoriteJokes).toHaveLength(999);
      expect(user.stats.favoriteJokes).not.toContain(500);
    });

    it('should handle extreme streak values', async () => {
      user.stats.dailyStreak = Number.MAX_SAFE_INTEGER - 1;
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      user.stats.lastVisit = yesterday;
      
      const streak = await user.updateStreak();
      expect(streak).toBe(Number.MAX_SAFE_INTEGER);
    });
  });
});