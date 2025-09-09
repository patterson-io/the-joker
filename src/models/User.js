/**
 * User model for personalization and gamification
 */
export class User {
  /**
   * Creates a new User instance
   * @param {string} id - Unique user identifier
   * @param {Object} preferences - User preferences
   */
  constructor(id, preferences = {}) {
    this.id = id;
    this.preferences = {
      categories: preferences.categories || [],
      excludeCategories: preferences.excludeCategories || [],
      safetyLevel: preferences.safetyLevel || 'family-friendly',
      ...preferences
    };
    this.stats = {
      jokesViewed: 0,
      favoriteJokes: [],
      dailyStreak: 0,
      lastVisit: null,
      achievements: []
    };
    this.createdAt = new Date();
  }

  /**
   * Update user preferences
   * @param {Object} newPreferences - New preference settings
   * @returns {Promise<void>}
   */
  async updatePreferences(newPreferences) {
    try {
      this.preferences = { ...this.preferences, ...newPreferences };
      return Promise.resolve();
    } catch (error) {
      throw new Error(`Failed to update preferences: ${error.message}`);
    }
  }

  /**
   * Add a joke to favorites
   * @param {number} jokeId - ID of the joke to favorite
   * @returns {Promise<boolean>}
   */
  async addFavorite(jokeId) {
    try {
      if (!this.stats.favoriteJokes.includes(jokeId)) {
        this.stats.favoriteJokes.push(jokeId);
        return true;
      }
      return false;
    } catch (error) {
      throw new Error(`Failed to add favorite: ${error.message}`);
    }
  }

  /**
   * Remove a joke from favorites
   * @param {number} jokeId - ID of the joke to unfavorite
   * @returns {Promise<boolean>}
   */
  async removeFavorite(jokeId) {
    try {
      const index = this.stats.favoriteJokes.indexOf(jokeId);
      if (index > -1) {
        this.stats.favoriteJokes.splice(index, 1);
        return true;
      }
      return false;
    } catch (error) {
      throw new Error(`Failed to remove favorite: ${error.message}`);
    }
  }

  /**
   * Update daily streak based on visit
   * @returns {Promise<number>}
   */
  async updateStreak() {
    try {
      const today = new Date().toDateString();
      const lastVisit = this.stats.lastVisit ? new Date(this.stats.lastVisit).toDateString() : null;
      
      if (lastVisit === today) {
        // Already visited today
        return this.stats.dailyStreak;
      }
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      
      if (lastVisit === yesterdayStr) {
        // Consecutive day - increment streak
        this.stats.dailyStreak += 1;
      } else if (lastVisit) {
        // Broke streak - reset to 1
        this.stats.dailyStreak = 1;
      } else {
        // First visit
        this.stats.dailyStreak = 1;
      }
      
      this.stats.lastVisit = new Date();
      return this.stats.dailyStreak;
    } catch (error) {
      throw new Error(`Failed to update streak: ${error.message}`);
    }
  }

  /**
   * Add an achievement
   * @param {string} achievement - Achievement name
   * @returns {Promise<boolean>}
   */
  async addAchievement(achievement) {
    try {
      if (!this.stats.achievements.includes(achievement)) {
        this.stats.achievements.push(achievement);
        return true;
      }
      return false;
    } catch (error) {
      throw new Error(`Failed to add achievement: ${error.message}`);
    }
  }

  /**
   * Get user's recommendation score for a joke category
   * @param {string} category - Joke category
   * @returns {number} Score from 0-1
   */
  getCategoryScore(category) {
    const { categories, excludeCategories } = this.preferences;
    
    if (excludeCategories.includes(category)) return 0;
    if (categories.includes(category)) return 1;
    
    // Default neutral score
    return 0.5;
  }

  /**
   * Serialize user data for storage
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      preferences: this.preferences,
      stats: this.stats,
      createdAt: this.createdAt
    };
  }

  /**
   * Create User instance from serialized data
   * @param {Object} data - Serialized user data
   * @returns {User}
   */
  static fromJSON(data) {
    const user = new User(data.id, data.preferences);
    user.stats = data.stats;
    user.createdAt = new Date(data.createdAt);
    return user;
  }
}