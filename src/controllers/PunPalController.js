import { JokeService } from '../services/JokeService.js';
import { SharingService } from '../services/SharingService.js';
import { User } from '../models/User.js';
import { LocalStorageManager, EventEmitter, PerformanceTracker } from '../utils/helpers.js';

/**
 * Main application controller for PunPal
 * Orchestrates all services and handles cross-platform compatibility
 */
export class PunPalController {
  /**
   * Initialize the PunPal application
   * @param {Object} config - Application configuration
   */
  constructor(config = {}) {
    this.config = {
      enableAI: config.enableAI || false,
      aiEndpoint: config.aiEndpoint || null,
      baseUrl: config.baseUrl || 'https://punpal.app',
      appName: config.appName || 'PunPal',
      userStorageKey: config.userStorageKey || 'punpal_user',
      cacheTimeout: config.cacheTimeout || 300000,
      ...config
    };

    // Initialize services
    this.jokeService = new JokeService({
      enableAI: this.config.enableAI,
      aiEndpoint: this.config.aiEndpoint,
      cacheTimeout: this.config.cacheTimeout
    });

    this.sharingService = new SharingService({
      baseUrl: this.config.baseUrl,
      appName: this.config.appName
    });

    // Initialize utilities
    this.eventEmitter = new EventEmitter();
    this.performanceTracker = new PerformanceTracker();
    
    // Application state
    this.currentUser = null;
    this.isInitialized = false;
    this.currentJoke = null;
    this.dailyJokes = [];
    
    // Bind methods for proper this context
    this.handleError = this.handleError.bind(this);
    this.trackEvent = this.trackEvent.bind(this);
  }

  /**
   * Initialize the application
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      this.performanceTracker.mark('app_init');
      
      // Load or create user
      await this.initializeUser();
      
      // Pre-load daily jokes
      await this.loadDailyJokes();
      
      // Set up event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      
      const initTime = this.performanceTracker.measure('app_init');
      this.trackEvent('app_initialized', { initTime });
      
      this.eventEmitter.emit('app:initialized', { user: this.currentUser });
      
    } catch (error) {
      this.handleError('Failed to initialize application', error);
      throw error;
    }
  }

  /**
   * Get the current user's daily joke
   * @returns {Promise<Object>} Daily joke with metadata
   */
  async getDailyJoke() {
    try {
      this.performanceTracker.mark('get_daily_joke');
      
      if (!this.currentUser) {
        throw new Error('User not initialized');
      }

      // Update user's daily streak
      const streak = await this.currentUser.updateStreak();
      
      // Get personalized joke for today
      const personalizedJokes = await this.jokeService.getPersonalizedJokes(this.currentUser, 1);
      
      if (personalizedJokes.length === 0) {
        // Fallback to random joke
        const randomJoke = await this.jokeService.getRandomJoke({
          safetyLevel: this.currentUser.preferences.safetyLevel
        });
        
        if (!randomJoke) {
          throw new Error('No jokes available');
        }
        
        personalizedJokes.push(randomJoke);
      }

      const dailyJoke = {
        ...personalizedJokes[0],
        dailyStreak: streak,
        isDaily: true,
        achievements: await this.checkAchievements(streak)
      };

      this.currentJoke = dailyJoke;
      this.currentUser.stats.jokesViewed += 1;
      
      // Save user data
      await this.saveUserData();
      
      const loadTime = this.performanceTracker.measure('get_daily_joke');
      this.trackEvent('daily_joke_viewed', { 
        jokeId: dailyJoke.id, 
        streak, 
        loadTime,
        source: dailyJoke.source 
      });
      
      this.eventEmitter.emit('joke:viewed', dailyJoke);
      
      return dailyJoke;
      
    } catch (error) {
      this.handleError('Failed to get daily joke', error);
      throw error;
    }
  }

  /**
   * Get a random joke with user preferences
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Random joke
   */
  async getRandomJoke(options = {}) {
    try {
      this.performanceTracker.mark('get_random_joke');
      
      const filters = {
        safetyLevel: this.currentUser?.preferences?.safetyLevel || 'family-friendly',
        categories: this.currentUser?.preferences?.categories || [],
        excludeCategories: this.currentUser?.preferences?.excludeCategories || [],
        excludeIds: options.excludeCurrentJoke && this.currentJoke ? [this.currentJoke.id] : [],
        ...options.filters
      };

      const joke = await this.jokeService.getRandomJoke(filters);
      
      if (!joke) {
        throw new Error('No jokes found matching criteria');
      }

      this.currentJoke = joke;
      
      if (this.currentUser) {
        this.currentUser.stats.jokesViewed += 1;
        await this.saveUserData();
      }
      
      const loadTime = this.performanceTracker.measure('get_random_joke');
      this.trackEvent('random_joke_viewed', { 
        jokeId: joke.id, 
        loadTime,
        source: joke.source 
      });
      
      this.eventEmitter.emit('joke:viewed', joke);
      
      return joke;
      
    } catch (error) {
      this.handleError('Failed to get random joke', error);
      throw error;
    }
  }

  /**
   * Search for jokes
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array<Object>>} Search results
   */
  async searchJokes(query, options = {}) {
    try {
      this.performanceTracker.mark('search_jokes');
      
      const filters = {
        safetyLevel: this.currentUser?.preferences?.safetyLevel || 'family-friendly',
        ...options.filters
      };

      const results = await this.jokeService.searchJokes(query, filters);
      
      const searchTime = this.performanceTracker.measure('search_jokes');
      this.trackEvent('jokes_searched', { 
        query, 
        resultsCount: results.length, 
        searchTime 
      });
      
      this.eventEmitter.emit('jokes:searched', { query, results });
      
      return results;
      
    } catch (error) {
      this.handleError('Failed to search jokes', error);
      throw error;
    }
  }

  /**
   * Share current joke
   * @param {string} platform - Platform to share to
   * @param {Object} options - Sharing options
   * @returns {Promise<Object>} Share result
   */
  async shareJoke(platform, options = {}) {
    try {
      if (!this.currentJoke) {
        throw new Error('No joke to share');
      }

      this.performanceTracker.mark('share_joke');
      
      const shareOptions = {
        ...options,
        url: await this.sharingService.generateShareableLink(this.currentJoke, {
          utm_source: platform,
          utm_medium: 'share',
          utm_campaign: 'joke_share'
        })
      };

      const result = await this.sharingService.shareJoke(this.currentJoke, platform, shareOptions);
      
      const shareTime = this.performanceTracker.measure('share_joke');
      this.trackEvent('joke_shared', { 
        jokeId: this.currentJoke.id, 
        platform, 
        shareTime,
        success: result.success 
      });
      
      this.eventEmitter.emit('joke:shared', { joke: this.currentJoke, platform, result });
      
      return result;
      
    } catch (error) {
      this.handleError('Failed to share joke', error);
      throw error;
    }
  }

  /**
   * Toggle joke as favorite
   * @param {number} jokeId - Joke ID to favorite/unfavorite
   * @returns {Promise<boolean>} True if favorited, false if unfavorited
   */
  async toggleFavorite(jokeId = null) {
    try {
      if (!this.currentUser) {
        throw new Error('User not initialized');
      }

      const targetId = jokeId || this.currentJoke?.id;
      
      if (!targetId) {
        throw new Error('No joke to favorite');
      }

      const isFavorited = this.currentUser.stats.favoriteJokes.includes(targetId);
      
      let result;
      if (isFavorited) {
        result = await this.currentUser.removeFavorite(targetId);
      } else {
        result = await this.currentUser.addFavorite(targetId);
      }

      if (result) {
        await this.saveUserData();
        
        this.trackEvent('joke_favorited', { 
          jokeId: targetId, 
          action: isFavorited ? 'unfavorited' : 'favorited' 
        });
        
        this.eventEmitter.emit('joke:favorited', { 
          jokeId: targetId, 
          isFavorited: !isFavorited 
        });
      }

      return !isFavorited;
      
    } catch (error) {
      this.handleError('Failed to toggle favorite', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   * @param {Object} preferences - New preferences
   * @returns {Promise<void>}
   */
  async updateUserPreferences(preferences) {
    try {
      if (!this.currentUser) {
        throw new Error('User not initialized');
      }

      await this.currentUser.updatePreferences(preferences);
      await this.saveUserData();
      
      this.trackEvent('preferences_updated', { preferences });
      this.eventEmitter.emit('user:preferences_updated', { user: this.currentUser });
      
    } catch (error) {
      this.handleError('Failed to update preferences', error);
      throw error;
    }
  }

  /**
   * Get user statistics and achievements
   * @returns {Promise<Object>} User stats
   */
  async getUserStats() {
    try {
      if (!this.currentUser) {
        throw new Error('User not initialized');
      }

      const jokeStats = await this.jokeService.getStats();
      
      return {
        user: {
          ...this.currentUser.stats,
          memberSince: this.currentUser.createdAt
        },
        jokes: jokeStats,
        achievements: await this.getAvailableAchievements()
      };
      
    } catch (error) {
      this.handleError('Failed to get user stats', error);
      throw error;
    }
  }

  /**
   * Generate AI joke (if enabled)
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object|null>} Generated joke or null
   */
  async generateAIJoke(params = {}) {
    try {
      if (!this.config.enableAI) {
        throw new Error('AI joke generation is not enabled');
      }

      this.performanceTracker.mark('generate_ai_joke');
      
      const generatedJoke = await this.jokeService.generateAIJoke(params);
      
      if (generatedJoke) {
        this.currentJoke = generatedJoke;
        
        if (this.currentUser) {
          this.currentUser.stats.jokesViewed += 1;
          await this.saveUserData();
        }
      }
      
      const generateTime = this.performanceTracker.measure('generate_ai_joke');
      this.trackEvent('ai_joke_generated', { 
        success: !!generatedJoke, 
        generateTime,
        params 
      });
      
      if (generatedJoke) {
        this.eventEmitter.emit('joke:generated', generatedJoke);
      }
      
      return generatedJoke;
      
    } catch (error) {
      this.handleError('Failed to generate AI joke', error);
      throw error;
    }
  }

  /**
   * Get available joke categories
   * @returns {Promise<Object>} Categories with descriptions
   */
  async getCategories() {
    try {
      return await this.jokeService.getCategories();
    } catch (error) {
      this.handleError('Failed to get categories', error);
      throw error;
    }
  }

  /**
   * Initialize or load user data
   * @returns {Promise<void>}
   * @private
   */
  async initializeUser() {
    try {
      const userData = await LocalStorageManager.getItem(this.config.userStorageKey);
      
      if (userData) {
        this.currentUser = User.fromJSON(userData);
      } else {
        // Create new user with timestamp-based ID for uniqueness
        const userId = `user_${Date.now()}_${process.pid || 0}`;
        this.currentUser = new User(userId, {
          safetyLevel: 'family-friendly',
          categories: [],
          excludeCategories: []
        });
        
        await this.saveUserData();
      }
      
    } catch {
      // Fallback to anonymous user if storage fails
      this.currentUser = new User('anonymous', {
        safetyLevel: 'family-friendly'
      });
    }
  }

  /**
   * Save user data to storage
   * @returns {Promise<void>}
   * @private
   */
  async saveUserData() {
    try {
      if (this.currentUser && this.currentUser.id !== 'anonymous') {
        await LocalStorageManager.setItem(this.config.userStorageKey, this.currentUser.toJSON());
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to save user data:', error.message);
    }
  }

  /**
   * Load daily jokes for better performance
   * @returns {Promise<void>}
   * @private
   */
  async loadDailyJokes() {
    try {
      const result = await this.jokeService.getJokes({ 
        limit: 10, 
        filters: { 
          safetyLevel: this.currentUser?.preferences?.safetyLevel || 'family-friendly' 
        } 
      });
      
      this.dailyJokes = result.jokes;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to pre-load daily jokes:', error.message);
      this.dailyJokes = [];
    }
  }

  /**
   * Check for new achievements based on user activity
   * @param {number} streak - Current daily streak
   * @returns {Promise<Array<string>>} New achievements
   * @private
   */
  async checkAchievements(streak) {
    const newAchievements = [];
    
    try {
      if (!this.currentUser) return newAchievements;

      const { stats } = this.currentUser;
      
      // Streak achievements
      if (streak >= 7 && !stats.achievements.includes('week_warrior')) {
        await this.currentUser.addAchievement('week_warrior');
        newAchievements.push('week_warrior');
      }
      
      if (streak >= 30 && !stats.achievements.includes('monthly_master')) {
        await this.currentUser.addAchievement('monthly_master');
        newAchievements.push('monthly_master');
      }
      
      // Viewing achievements
      if (stats.jokesViewed >= 50 && !stats.achievements.includes('joke_enthusiast')) {
        await this.currentUser.addAchievement('joke_enthusiast');
        newAchievements.push('joke_enthusiast');
      }
      
      if (stats.jokesViewed >= 200 && !stats.achievements.includes('comedy_connoisseur')) {
        await this.currentUser.addAchievement('comedy_connoisseur');
        newAchievements.push('comedy_connoisseur');
      }
      
      // Favorite achievements
      if (stats.favoriteJokes.length >= 10 && !stats.achievements.includes('curator')) {
        await this.currentUser.addAchievement('curator');
        newAchievements.push('curator');
      }
      
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to check achievements:', error.message);
    }
    
    return newAchievements;
  }

  /**
   * Get list of available achievements
   * @returns {Promise<Object>} Achievement definitions
   * @private
   */
  async getAvailableAchievements() {
    return {
      week_warrior: {
        name: 'Week Warrior',
        description: 'View jokes for 7 consecutive days',
        icon: '🗓️'
      },
      monthly_master: {
        name: 'Monthly Master',
        description: 'View jokes for 30 consecutive days',
        icon: '📅'
      },
      joke_enthusiast: {
        name: 'Joke Enthusiast',
        description: 'View 50 jokes',
        icon: '😄'
      },
      comedy_connoisseur: {
        name: 'Comedy Connoisseur',
        description: 'View 200 jokes',
        icon: '🎭'
      },
      curator: {
        name: 'Curator',
        description: 'Favorite 10 jokes',
        icon: '⭐'
      }
    };
  }

  /**
   * Set up event listeners for cross-component communication
   * @private
   */
  setupEventListeners() {
    // Example: Listen for user preferences changes to invalidate caches
    this.eventEmitter.on('user:preferences_updated', () => {
      // Clear cached personalized content
      this.dailyJokes = [];
    });
  }

  /**
   * Handle application errors
   * @param {string} message - Error message
   * @param {Error} _error - Original error (logged separately)
   * @private
   */
  handleError(message, _error) {
    // eslint-disable-next-line no-console
    console.error(`${message}:`, _error);
    
    this.trackEvent('error_occurred', { 
      message, 
      error: _error.message,
      stack: _error.stack 
    });
    
    this.eventEmitter.emit('app:error', { message, error: _error });
  }

  /**
   * Track analytics event
   * @param {string} eventName - Event name
   * @param {Object} properties - Event properties
   * @private
   */
  trackEvent(eventName, properties = {}) {
    // In a real app, this would send to analytics service
    // eslint-disable-next-line no-console
    console.debug(`Analytics: ${eventName}`, properties);
    
    this.eventEmitter.emit('analytics:track', { eventName, properties });
  }

  /**
   * Clean up resources
   * @returns {Promise<void>}
   */
  async destroy() {
    try {
      // Save final user state
      await this.saveUserData();
      
      // Clear event listeners
      this.eventEmitter.removeAllListeners();
      
      // Clear performance tracking
      this.performanceTracker.clear();
      
      this.isInitialized = false;
      
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Error during cleanup:', error.message);
    }
  }

  /**
   * Subscribe to application events
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    return this.eventEmitter.on(event, callback);
  }

  /**
   * Emit application event
   * @param {string} event - Event name
   * @param {...any} args - Event arguments
   */
  emit(event, ...args) {
    this.eventEmitter.emit(event, ...args);
  }
}