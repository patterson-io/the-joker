import { PunPalController } from './controllers/PunPalController.js';
import { getPlatformInfo, isNode, isBrowser } from './utils/helpers.js';

/**
 * Main PunPal application entry point
 * Supports both Node.js and browser environments
 */
class PunPalApp {
  /**
   * Initialize PunPal application
   * @param {Object} config - Application configuration
   */
  constructor(config = {}) {
    this.platform = getPlatformInfo();
    this.config = {
      // Default configuration
      enableAI: false,
      baseUrl: 'https://punpal.app',
      appName: 'PunPal - Your Daily Dad Joke Companion',
      ...config
    };
    
    this.controller = null;
    this.isRunning = false;
  }

  /**
   * Start the application
   * @returns {Promise<PunPalController>} Initialized controller
   */
  async start() {
    try {
      console.log('🎭 Starting PunPal...');
      console.log(`📱 Platform: ${this.platform.platform}`);
      console.log(`🌐 Environment: ${isNode() ? 'Node.js' : 'Browser'}`);
      
      // Initialize controller
      this.controller = new PunPalController(this.config);
      
      // Set up error handling
      this.setupErrorHandling();
      
      // Initialize the application
      await this.controller.initialize();
      
      this.isRunning = true;
      
      console.log('✅ PunPal started successfully!');
      
      // Demo the application
      if (isNode()) {
        await this.runNodeDemo();
      }
      
      return this.controller;
      
    } catch (error) {
      console.error('❌ Failed to start PunPal:', error.message);
      throw error;
    }
  }

  /**
   * Stop the application
   * @returns {Promise<void>}
   */
  async stop() {
    try {
      if (this.controller) {
        await this.controller.destroy();
      }
      
      this.isRunning = false;
      console.log('👋 PunPal stopped gracefully');
      
    } catch (error) {
      console.error('Error stopping PunPal:', error.message);
    }
  }

  /**
   * Set up global error handling
   * @private
   */
  setupErrorHandling() {
    if (this.controller) {
      this.controller.on('app:error', ({ message, error }) => {
        console.error(`🚨 PunPal Error: ${message}`, error);
      });
      
      this.controller.on('app:initialized', ({ user }) => {
        console.log(`👤 User initialized: ${user.id}`);
      });
    }

    // Handle uncaught errors
    if (isNode()) {
      process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception:', error);
        this.stop().finally(() => process.exit(1));
      });
      
      process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      });
    }
  }

  /**
   * Run a demonstration of PunPal features (Node.js)
   * @returns {Promise<void>}
   * @private
   */
  async runNodeDemo() {
    try {
      console.log('\n🎯 Running PunPal Demo...\n');

      // Get daily joke
      console.log('📅 Getting daily joke...');
      const dailyJoke = await this.controller.getDailyJoke();
      console.log(`😄 Daily Joke: "${dailyJoke.text}"`);
      console.log(`🔥 Daily Streak: ${dailyJoke.dailyStreak} days`);
      
      if (dailyJoke.achievements.length > 0) {
        console.log(`🏆 New Achievements: ${dailyJoke.achievements.join(', ')}`);
      }

      // Get random joke
      console.log('\n🎲 Getting random joke...');
      const randomJoke = await this.controller.getRandomJoke();
      console.log(`😂 Random Joke: "${randomJoke.text}"`);
      console.log(`📂 Category: ${randomJoke.category}`);

      // Favorite the joke
      console.log('\n⭐ Adding joke to favorites...');
      const favorited = await this.controller.toggleFavorite(randomJoke.id);
      console.log(`${favorited ? '💝' : '💔'} Joke ${favorited ? 'favorited' : 'unfavorited'}`);

      // Search for jokes
      console.log('\n🔍 Searching for science jokes...');
      const searchResults = await this.controller.searchJokes('science');
      console.log(`📊 Found ${searchResults.length} science jokes`);
      
      if (searchResults.length > 0) {
        console.log(`🧪 Example: "${searchResults[0].text}"`);
      }

      // Get categories
      console.log('\n📂 Available categories...');
      const categories = await this.controller.getCategories();
      console.log(`📋 Categories: ${Object.keys(categories).join(', ')}`);

      // Get user stats
      console.log('\n📊 User statistics...');
      const stats = await this.controller.getUserStats();
      console.log(`👀 Jokes viewed: ${stats.user.jokesViewed}`);
      console.log(`💖 Favorites: ${stats.user.favoriteJokes.length}`);
      console.log(`🏆 Achievements: ${stats.user.achievements.length}`);

      // Simulate sharing
      console.log('\n📤 Generating share links...');
      const shareResult = await this.controller.shareJoke('twitter');
      console.log(`🐦 Twitter share URL: ${shareResult.shareUrl}`);

      console.log('\n🎉 Demo completed successfully!');
      console.log('\n💡 To integrate PunPal in your app:');
      console.log('   import { PunPalApp } from "./src/index.js";');
      console.log('   const app = new PunPalApp();');
      console.log('   const controller = await app.start();');
      
    } catch (error) {
      console.error('❌ Demo failed:', error.message);
    }
  }

  /**
   * Get the application controller
   * @returns {PunPalController|null} Controller instance
   */
  getController() {
    return this.controller;
  }

  /**
   * Check if application is running
   * @returns {boolean} Running status
   */
  isAppRunning() {
    return this.isRunning;
  }
}

// Export for both Node.js and browser environments
export { PunPalApp, PunPalController };

// Auto-start if running directly in Node.js
if (isNode() && import.meta.url === `file://${process.argv[1]}`) {
  const app = new PunPalApp({
    enableAI: false, // Set to true if you have an AI endpoint
    appName: 'PunPal Demo'
  });
  
  app.start().catch(error => {
    console.error('Failed to start PunPal:', error);
    process.exit(1);
  });
}

/*
---

Why don't scientists trust atoms? Because they make up everything!
*/