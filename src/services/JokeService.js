import { JOKES_DATABASE, CONTENT_FILTER, JOKE_CATEGORIES } from '../models/Joke.js';

/**
 * Service for managing dad jokes with personalization and safety features
 * Uses modern async/await patterns and ES6+ features
 */
export class JokeService {
  /**
   * Initialize the joke service
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.jokes = [...JOKES_DATABASE];
    this.contentFilter = [...CONTENT_FILTER];
    this.categories = { ...JOKE_CATEGORIES };
    this.cache = new Map();
    this.options = {
      enableAI: options.enableAI || false,
      aiEndpoint: options.aiEndpoint || null,
      cacheTimeout: options.cacheTimeout || 300000, // 5 minutes
      ...options
    };
  }

  /**
   * Get a random joke with optional filtering
   * @param {Object} filters - Filtering options
   * @param {Array<string>} filters.categories - Preferred categories
   * @param {Array<string>} filters.excludeCategories - Categories to exclude
   * @param {string} filters.safetyLevel - Content safety level
   * @param {Array<number>} filters.excludeIds - Joke IDs to exclude
   * @returns {Promise<Object|null>} Random joke or null if none found
   */
  async getRandomJoke(filters = {}) {
    try {
      const filteredJokes = await this.filterJokes(filters);
      
      if (filteredJokes.length === 0) {
        return null;
      }

      const randomIndex = Math.floor(Math.random() * filteredJokes.length);
      const selectedJoke = filteredJokes[randomIndex];

      // Add metadata
      return {
        ...selectedJoke,
        timestamp: new Date().toISOString(),
        source: 'database'
      };
    } catch (error) {
      throw new Error(`Failed to get random joke: ${error.message}`);
    }
  }

  /**
   * Get multiple jokes with pagination
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (1-based)
   * @param {number} options.limit - Jokes per page
   * @param {Object} options.filters - Filtering options
   * @returns {Promise<Object>} Paginated joke results
   */
  async getJokes({ page = 1, limit = 10, filters = {} } = {}) {
    try {
      const filteredJokes = await this.filterJokes(filters);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      const jokes = filteredJokes.slice(startIndex, endIndex);
      const totalPages = Math.ceil(filteredJokes.length / limit);

      return {
        jokes,
        pagination: {
          page,
          limit,
          total: filteredJokes.length,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Failed to get jokes: ${error.message}`);
    }
  }

  /**
   * Get personalized joke recommendations for a user
   * @param {User} user - User instance for personalization
   * @param {number} count - Number of jokes to recommend
   * @returns {Promise<Array<Object>>} Recommended jokes
   */
  async getPersonalizedJokes(user, count = 5) {
    try {
      const filters = {
        categories: user.preferences.categories,
        excludeCategories: user.preferences.excludeCategories,
        safetyLevel: user.preferences.safetyLevel,
        excludeIds: user.stats.favoriteJokes // Don't recommend already favorited jokes
      };

      const filteredJokes = await this.filterJokes(filters);
      
      // Score jokes based on user preferences and interaction history
      const scoredJokes = filteredJokes.map(joke => ({
        ...joke,
        score: this.calculatePersonalizationScore(joke, user)
      }));

      // Sort by score and return top results
      const topJokes = scoredJokes
        .sort((a, b) => b.score - a.score)
        .slice(0, count);

      return topJokes.map(joke => {
        // eslint-disable-next-line no-unused-vars
        const { score: _, ...jokeWithoutScore } = joke;
        return {
          ...jokeWithoutScore,
          timestamp: new Date().toISOString(),
          source: 'personalized'
        };
      });
    } catch (error) {
      throw new Error(`Failed to get personalized jokes: ${error.message}`);
    }
  }

  /**
   * Search jokes by text content
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array<Object>>} Matching jokes
   */
  async searchJokes(query, filters = {}) {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }

      const searchTerm = query.toLowerCase().trim();
      const filteredJokes = await this.filterJokes(filters);
      
      const matchingJokes = filteredJokes.filter(joke => {
        const textMatch = joke.text.toLowerCase().includes(searchTerm);
        const tagMatch = joke.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        const categoryMatch = joke.category.toLowerCase().includes(searchTerm);
        
        return textMatch || tagMatch || categoryMatch;
      });

      return matchingJokes.map(joke => ({
        ...joke,
        timestamp: new Date().toISOString(),
        source: 'search'
      }));
    } catch (error) {
      throw new Error(`Failed to search jokes: ${error.message}`);
    }
  }

  /**
   * Get joke by ID
   * @param {number} id - Joke ID
   * @returns {Promise<Object|null>} Joke object or null if not found
   */
  async getJokeById(id) {
    try {
      const joke = this.jokes.find(j => j.id === id);
      
      if (!joke) {
        return null;
      }

      // Apply content safety check
      if (!this.isContentSafe(joke)) {
        return null;
      }

      return {
        ...joke,
        timestamp: new Date().toISOString(),
        source: 'database'
      };
    } catch (error) {
      throw new Error(`Failed to get joke by ID: ${error.message}`);
    }
  }

  /**
   * Generate AI-assisted joke (if enabled)
   * @param {Object} params - Generation parameters
   * @param {string} params.theme - Joke theme
   * @param {string} params.style - Joke style
   * @returns {Promise<Object|null>} Generated joke or null if unavailable
   */
  async generateAIJoke({ theme = 'general', style = 'dad-joke' } = {}) {
    try {
      if (!this.options.enableAI || !this.options.aiEndpoint) {
        throw new Error('AI joke generation not enabled or configured');
      }

      // Simulate AI generation with timeout
      const response = await Promise.race([
        this.callAIService(theme),
        this.timeoutPromise(10000) // 10 second timeout
      ]);

      if (!response || !response.text) {
        return null;
      }

      // Apply content safety check
      const generatedJoke = {
        id: Date.now(), // Temporary ID
        text: response.text,
        category: theme,
        rating: 'family-friendly',
        tags: [theme, style, 'ai-generated'],
        source: 'ai-generated',
        timestamp: new Date().toISOString()
      };

      if (!this.isContentSafe(generatedJoke)) {
        throw new Error('Generated content failed safety check');
      }

      return generatedJoke;
    } catch (error) {
      throw new Error(`Failed to generate AI joke: ${error.message}`);
    }
  }

  /**
   * Filter jokes based on criteria
   * @param {Object} filters - Filtering options
   * @returns {Promise<Array<Object>>} Filtered jokes
   * @private
   */
  async filterJokes(filters) {
    try {
      let filtered = [...this.jokes];

      // Apply content safety filter
      filtered = filtered.filter(joke => this.isContentSafe(joke));

      // Filter by safety level
      if (filters.safetyLevel) {
        filtered = filtered.filter(joke => joke.rating === filters.safetyLevel);
      }

      // Filter by included categories
      if (filters.categories && filters.categories.length > 0) {
        filtered = filtered.filter(joke => filters.categories.includes(joke.category));
      }

      // Filter by excluded categories
      if (filters.excludeCategories && filters.excludeCategories.length > 0) {
        filtered = filtered.filter(joke => !filters.excludeCategories.includes(joke.category));
      }

      // Exclude specific joke IDs
      if (filters.excludeIds && filters.excludeIds.length > 0) {
        filtered = filtered.filter(joke => !filters.excludeIds.includes(joke.id));
      }

      return filtered;
    } catch (error) {
      throw new Error(`Failed to filter jokes: ${error.message}`);
    }
  }

  /**
   * Calculate personalization score for a joke
   * @param {Object} joke - Joke object
   * @param {User} user - User instance
   * @returns {number} Personalization score (0-1)
   * @private
   */
  calculatePersonalizationScore(joke, user) {
    let score = 0.5; // Base score

    // Category preference bonus
    score += user.getCategoryScore(joke.category) * 0.3;

    // Tag matching bonus
    const userInterests = [...user.preferences.categories, ...user.stats.achievements];
    const tagMatches = joke.tags.filter(tag => userInterests.includes(tag)).length;
    score += (tagMatches / joke.tags.length) * 0.2;

    // Ensure score stays within bounds
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Check if content passes safety filters
   * @param {Object} joke - Joke object
   * @returns {boolean} True if content is safe
   * @private
   */
  isContentSafe(joke) {
    const text = joke.text.toLowerCase();
    return !this.contentFilter.some(keyword => text.includes(keyword.toLowerCase()));
  }

  /**
   * Create a timeout promise for race conditions
   * @param {number} ms - Timeout in milliseconds
   * @returns {Promise} Promise that rejects after timeout
   * @private
   */
  timeoutPromise(ms) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), ms);
    });
  }

  /**
   * Mock AI service call (placeholder for real implementation)
   * @param {string} theme - Joke theme
   * @returns {Promise<Object>} AI response
   * @private
   */
  async callAIService(theme) {
    // This is a mock implementation
    // In a real app, this would call an external AI service
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: `Why don't ${theme} experts ever get lost? Because they always know their way around!`,
          confidence: 0.8
        });
      }, 1000);
    });
  }

  /**
   * Get available joke categories
   * @returns {Promise<Object>} Categories with descriptions
   */
  async getCategories() {
    try {
      return { ...this.categories };
    } catch (error) {
      throw new Error(`Failed to get categories: ${error.message}`);
    }
  }

  /**
   * Get service statistics
   * @returns {Promise<Object>} Service statistics
   */
  async getStats() {
    try {
      const categories = Object.keys(this.categories);
      const jokesByCategory = {};
      
      categories.forEach(category => {
        jokesByCategory[category] = this.jokes.filter(joke => joke.category === category).length;
      });

      return {
        totalJokes: this.jokes.length,
        categories: categories.length,
        jokesByCategory,
        aiEnabled: this.options.enableAI,
        cacheSize: this.cache.size
      };
    } catch (error) {
      throw new Error(`Failed to get stats: ${error.message}`);
    }
  }
}