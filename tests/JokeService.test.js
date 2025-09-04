import { jest } from '@jest/globals';
import { JokeService } from '../src/services/JokeService.js';
import { User } from '../src/models/User.js';

/**
 * Test suite for JokeService
 * Tests async patterns, error handling, and core functionality
 */
describe('JokeService', () => {
  let jokeService;

  beforeEach(() => {
    jokeService = new JokeService();
  });

  describe('getRandomJoke', () => {
    it('should return a random joke', async () => {
      const joke = await jokeService.getRandomJoke();
      
      expect(joke).toBeDefined();
      expect(joke.text).toBeDefined();
      expect(joke.category).toBeDefined();
      expect(joke.rating).toBe('family-friendly');
      expect(joke.timestamp).toBeDefined();
      expect(joke.source).toBe('database');
    });

    it('should filter jokes by category', async () => {
      const joke = await jokeService.getRandomJoke({
        categories: ['science']
      });
      
      expect(joke).toBeDefined();
      expect(joke.category).toBe('science');
    });

    it('should exclude categories', async () => {
      const joke = await jokeService.getRandomJoke({
        excludeCategories: ['science', 'marriage', 'career']
      });
      
      expect(joke).toBeDefined();
      expect(['science', 'marriage', 'career']).not.toContain(joke.category);
    });

    it('should exclude specific joke IDs', async () => {
      const firstJoke = await jokeService.getRandomJoke();
      const secondJoke = await jokeService.getRandomJoke({
        excludeIds: [firstJoke.id]
      });
      
      expect(secondJoke).toBeDefined();
      expect(secondJoke.id).not.toBe(firstJoke.id);
    });

    it('should return null when no jokes match filters', async () => {
      const joke = await jokeService.getRandomJoke({
        categories: ['nonexistent-category']
      });
      
      expect(joke).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      // Mock a service error
      jest.spyOn(jokeService, 'filterJokes').mockRejectedValueOnce(new Error('Filter error'));
      
      await expect(jokeService.getRandomJoke()).rejects.toThrow('Failed to get random joke: Filter error');
    });
  });

  describe('getJokes', () => {
    it('should return paginated jokes', async () => {
      const result = await jokeService.getJokes({
        page: 1,
        limit: 5
      });
      
      expect(result.jokes).toBeDefined();
      expect(result.jokes.length).toBeLessThanOrEqual(5);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.total).toBeGreaterThan(0);
    });

    it('should handle empty results', async () => {
      const result = await jokeService.getJokes({
        page: 999,
        limit: 10
      });
      
      expect(result.jokes).toEqual([]);
      expect(result.pagination.hasNext).toBe(false);
    });
  });

  describe('getPersonalizedJokes', () => {
    it('should return personalized jokes for user', async () => {
      const user = new User('test-user', {
        categories: ['science', 'technology'],
        safetyLevel: 'family-friendly'
      });

      const jokes = await jokeService.getPersonalizedJokes(user, 3);
      
      expect(jokes).toBeDefined();
      expect(jokes.length).toBeLessThanOrEqual(3);
      expect(jokes[0].source).toBe('personalized');
    });

    it('should exclude favorited jokes', async () => {
      const user = new User('test-user', {
        categories: ['science']
      });
      
      // Add some favorites
      await user.addFavorite(1);
      await user.addFavorite(2);

      const jokes = await jokeService.getPersonalizedJokes(user, 5);
      
      const favoriteIds = jokes.map(joke => joke.id);
      expect(favoriteIds).not.toContain(1);
      expect(favoriteIds).not.toContain(2);
    });
  });

  describe('searchJokes', () => {
    it('should find jokes by text content', async () => {
      const results = await jokeService.searchJokes('atom');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].text.toLowerCase()).toContain('atom');
      expect(results[0].source).toBe('search');
    });

    it('should find jokes by tags', async () => {
      const results = await jokeService.searchJokes('science');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(joke => 
        joke.tags.includes('science') || joke.category === 'science'
      )).toBe(true);
    });

    it('should return empty array for empty query', async () => {
      const results = await jokeService.searchJokes('');
      expect(results).toEqual([]);
    });

    it('should return empty array for no matches', async () => {
      const results = await jokeService.searchJokes('zzzznonexistentzzzzz');
      expect(results).toEqual([]);
    });
  });

  describe('getJokeById', () => {
    it('should return joke by ID', async () => {
      const joke = await jokeService.getJokeById(1);
      
      expect(joke).toBeDefined();
      expect(joke.id).toBe(1);
      expect(joke.source).toBe('database');
    });

    it('should return null for non-existent ID', async () => {
      const joke = await jokeService.getJokeById(99999);
      expect(joke).toBeNull();
    });
  });

  describe('generateAIJoke', () => {
    it('should throw error when AI not enabled', async () => {
      await expect(jokeService.generateAIJoke()).rejects.toThrow('AI joke generation not enabled or configured');
    });

    it('should generate AI joke when enabled', async () => {
      const aiService = new JokeService({
        enableAI: true,
        aiEndpoint: 'mock://ai-service'
      });

      const joke = await aiService.generateAIJoke({
        theme: 'programming',
        style: 'dad-joke'
      });
      
      expect(joke).toBeDefined();
      expect(joke.text).toBeDefined();
      expect(joke.category).toBe('programming');
      expect(joke.source).toBe('ai-generated');
      expect(joke.tags).toContain('ai-generated');
    });

    it('should handle AI service timeout', async () => {
      const aiService = new JokeService({
        enableAI: true,
        aiEndpoint: 'mock://ai-service'
      });

      // Mock a slow AI service
      jest.spyOn(aiService, 'callAIService').mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 15000))
      );

      await expect(aiService.generateAIJoke()).rejects.toThrow('Failed to generate AI joke: Operation timed out');
    });
  });

  describe('getCategories', () => {
    it('should return available categories', async () => {
      const categories = await jokeService.getCategories();
      
      expect(categories).toBeDefined();
      expect(typeof categories).toBe('object');
      expect(Object.keys(categories).length).toBeGreaterThan(0);
      expect(categories.science).toBeDefined();
    });
  });

  describe('getStats', () => {
    it('should return service statistics', async () => {
      const stats = await jokeService.getStats();
      
      expect(stats).toBeDefined();
      expect(stats.totalJokes).toBeGreaterThan(0);
      expect(stats.categories).toBeGreaterThan(0);
      expect(stats.jokesByCategory).toBeDefined();
      expect(stats.aiEnabled).toBe(false);
    });
  });

  describe('async error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Simulate database error
      jest.spyOn(jokeService, 'isContentSafe').mockImplementation(() => {
        throw new Error('Database connection lost');
      });

      await expect(jokeService.getRandomJoke()).rejects.toThrow('Failed to get random joke');
    });

    it('should handle concurrent requests', async () => {
      // Test race conditions
      const promises = Array.from({ length: 10 }, () => 
        jokeService.getRandomJoke()
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      results.forEach(joke => {
        expect(joke).toBeDefined();
        expect(joke.text).toBeDefined();
      });
    });

    it('should handle promise rejection in personalized jokes', async () => {
      const user = new User('test-user');
      
      // Mock user preference error
      jest.spyOn(user, 'getCategoryScore').mockImplementation(() => {
        throw new Error('Preference calculation error');
      });

      await expect(jokeService.getPersonalizedJokes(user)).rejects.toThrow('Failed to get personalized jokes');
    });
  });

  describe('content safety', () => {
    it('should filter unsafe content', async () => {
      // Test content safety filter
      const jokeWithFilter = {
        id: 999,
        text: 'This is a test joke',
        category: 'test',
        rating: 'family-friendly',
        tags: ['test']
      };

      const isSafe = jokeService.isContentSafe(jokeWithFilter);
      expect(isSafe).toBe(true);
    });

    it('should apply safety level filters', async () => {
      const jokes = await jokeService.getJokes({
        filters: { safetyLevel: 'family-friendly' }
      });

      jokes.jokes.forEach(joke => {
        expect(joke.rating).toBe('family-friendly');
      });
    });
  });

  describe('performance', () => {
    it('should complete requests within reasonable time', async () => {
      const startTime = performance.now();
      
      await jokeService.getRandomJoke();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within 100ms for local operations
      expect(duration).toBeLessThan(100);
    });

    it('should handle multiple concurrent requests efficiently', async () => {
      const startTime = performance.now();
      
      const promises = Array.from({ length: 50 }, () => 
        jokeService.getRandomJoke()
      );
      
      await Promise.all(promises);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 50 requests within 500ms
      expect(duration).toBeLessThan(500);
    });
  });
});