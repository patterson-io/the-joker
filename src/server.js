import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PunPalController } from './controllers/PunPalController.js';
import { User } from './models/User.js';
import { generateUUID } from './utils/helpers.js';

/**
 * Express server for PunPal API
 * Provides RESTful endpoints for the dad jokes application
 */
class PunPalServer {
  /**
   * Initialize the server
   * @param {Object} config - Server configuration
   */
  constructor(config = {}) {
    this.config = {
      port: config.port || process.env.PORT || 3000,
      host: config.host || 'localhost',
      corsOrigin: config.corsOrigin || '*',
      enableAI: config.enableAI || false,
      ...config
    };
    
    this.app = express();
    this.controller = new PunPalController({
      enableAI: this.config.enableAI,
      baseUrl: `http://${this.config.host}:${this.config.port}`
    });
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Set up Express middleware
   * @private
   */
  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));
    
    // CORS
    this.app.use(cors({
      origin: this.config.corsOrigin,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Set up API routes
   * @private
   */
  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    // Static files
    this.app.use(express.static('public'));

    // API routes
    const api = express.Router();
    
    // Get daily joke
    api.get('/daily', async (req, res) => {
      try {
        const user = this.getUserFromRequest(req);
        this.controller.currentUser = user;
        
        const joke = await this.controller.getDailyJoke();
        res.json({ success: true, data: joke });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get random joke
    api.get('/random', async (req, res) => {
      try {
        const options = {
          excludeCurrentJoke: req.query.exclude_current === 'true',
          filters: {}
        };
        
        if (req.query.category) {
          options.filters.categories = req.query.category.split(',');
        }
        
        if (req.query.exclude_category) {
          options.filters.excludeCategories = req.query.exclude_category.split(',');
        }

        const user = this.getUserFromRequest(req);
        this.controller.currentUser = user;
        
        const joke = await this.controller.getRandomJoke(options);
        res.json({ success: true, data: joke });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Search jokes
    api.get('/search', async (req, res) => {
      try {
        const { q: query, category, exclude_category } = req.query;
        
        if (!query) {
          return res.status(400).json({ 
            success: false, 
            error: 'Query parameter "q" is required' 
          });
        }

        const options = { filters: {} };
        
        if (category) {
          options.filters.categories = category.split(',');
        }
        
        if (exclude_category) {
          options.filters.excludeCategories = exclude_category.split(',');
        }

        const user = this.getUserFromRequest(req);
        this.controller.currentUser = user;
        
        const results = await this.controller.searchJokes(query, options);
        res.json({ success: true, data: results });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get joke by ID
    api.get('/joke/:id', async (req, res) => {
      try {
        const jokeId = parseInt(req.params.id);
        
        if (isNaN(jokeId)) {
          return res.status(400).json({ 
            success: false, 
            error: 'Invalid joke ID' 
          });
        }

        const joke = await this.controller.jokeService.getJokeById(jokeId);
        
        if (!joke) {
          return res.status(404).json({ 
            success: false, 
            error: 'Joke not found' 
          });
        }

        res.json({ success: true, data: joke });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get categories
    api.get('/categories', async (req, res) => {
      try {
        const categories = await this.controller.getCategories();
        res.json({ success: true, data: categories });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Generate shareable link
    api.post('/share/:platform', async (req, res) => {
      try {
        const { platform } = req.params;
        const { joke_id, custom_message } = req.body;

        if (!joke_id) {
          return res.status(400).json({ 
            success: false, 
            error: 'joke_id is required' 
          });
        }

        // Get the joke first
        const joke = await this.controller.jokeService.getJokeById(joke_id);
        
        if (!joke) {
          return res.status(404).json({ 
            success: false, 
            error: 'Joke not found' 
          });
        }

        // Set current joke and share
        this.controller.currentJoke = joke;
        
        const shareResult = await this.controller.shareJoke(platform, {
          customMessage: custom_message
        });
        
        res.json({ success: true, data: shareResult });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get sharing stats
    api.get('/stats/sharing/:jokeId', async (req, res) => {
      try {
        const jokeId = parseInt(req.params.jokeId);
        
        if (isNaN(jokeId)) {
          return res.status(400).json({ 
            success: false, 
            error: 'Invalid joke ID' 
          });
        }

        const stats = await this.controller.sharingService.getSharingStats(jokeId);
        res.json({ success: true, data: stats });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // User preferences
    api.put('/user/preferences', async (req, res) => {
      try {
        const user = this.getUserFromRequest(req);
        this.controller.currentUser = user;
        
        await this.controller.updateUserPreferences(req.body);
        res.json({ success: true, message: 'Preferences updated' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // User stats
    api.get('/user/stats', async (req, res) => {
      try {
        const user = this.getUserFromRequest(req);
        this.controller.currentUser = user;
        
        const stats = await this.controller.getUserStats();
        res.json({ success: true, data: stats });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Toggle favorite
    api.post('/user/favorite/:jokeId', async (req, res) => {
      try {
        const jokeId = parseInt(req.params.jokeId);
        
        if (isNaN(jokeId)) {
          return res.status(400).json({ 
            success: false, 
            error: 'Invalid joke ID' 
          });
        }

        const user = this.getUserFromRequest(req);
        this.controller.currentUser = user;
        
        const isFavorited = await this.controller.toggleFavorite(jokeId);
        res.json({ 
          success: true, 
          data: { 
            jokeId, 
            isFavorited,
            message: isFavorited ? 'Joke favorited' : 'Joke unfavorited'
          } 
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // AI joke generation (if enabled)
    if (this.config.enableAI) {
      api.post('/generate', async (req, res) => {
        try {
          const { theme, style } = req.body;
          
          const generatedJoke = await this.controller.generateAIJoke({ theme, style });
          
          if (!generatedJoke) {
            return res.status(503).json({ 
              success: false, 
              error: 'AI joke generation unavailable' 
            });
          }

          res.json({ success: true, data: generatedJoke });
        } catch (error) {
          res.status(500).json({ success: false, error: error.message });
        }
      });
    }

    // Mount API routes
    this.app.use('/api', api);

    // Serve frontend for joke sharing
    this.app.get('/joke', (req, res) => {
      const { joke_id } = req.query;
      
      // Sanitize the joke_id parameter to prevent XSS
      const safeJokeId = joke_id ? parseInt(joke_id, 10) : null;
      const isValidJokeId = safeJokeId && !isNaN(safeJokeId) && safeJokeId > 0;
      
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PunPal - Dad Jokes</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              max-width: 600px; 
              margin: 50px auto; 
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-align: center;
            }
            .joke-container {
              background: rgba(255, 255, 255, 0.1);
              padding: 30px;
              border-radius: 15px;
              backdrop-filter: blur(10px);
              margin: 20px 0;
            }
            .joke-text {
              font-size: 1.5em;
              margin: 20px 0;
              line-height: 1.4;
            }
            .share-buttons {
              display: flex;
              gap: 10px;
              justify-content: center;
              flex-wrap: wrap;
              margin-top: 30px;
            }
            .share-btn {
              padding: 10px 20px;
              border: none;
              border-radius: 25px;
              background: rgba(255, 255, 255, 0.2);
              color: white;
              text-decoration: none;
              cursor: pointer;
              transition: all 0.3s ease;
            }
            .share-btn:hover {
              background: rgba(255, 255, 255, 0.3);
              transform: translateY(-2px);
            }
            .logo {
              font-size: 2em;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="logo">🎭 PunPal</div>
          <h1>Your Daily Dad Joke Companion</h1>
          
          <div class="joke-container">
            <div id="joke-content">
              ${isValidJokeId ? `Loading joke #${safeJokeId}...` : "Why don't scientists trust atoms? Because they make up everything!"}
            </div>
          </div>
          
          <div class="share-buttons">
            <a href="#" class="share-btn" onclick="shareJoke('twitter')">🐦 Twitter</a>
            <a href="#" class="share-btn" onclick="shareJoke('facebook')">📘 Facebook</a>
            <a href="#" class="share-btn" onclick="shareJoke('whatsapp')">💬 WhatsApp</a>
            <a href="#" class="share-btn" onclick="copyJoke()">📋 Copy</a>
          </div>
          
          <p style="margin-top: 40px; opacity: 0.8;">
            Get your daily dose of dad jokes with PunPal!
          </p>
          
          <script>
            let currentJoke = null;
            
            async function loadJoke() {
              try {
                const params = new URLSearchParams(window.location.search);
                const jokeId = params.get('joke_id');
                
                if (jokeId && /^\\d+$/.test(jokeId)) {
                  const response = await fetch(\`/api/joke/\${parseInt(jokeId, 10)}\`);
                  const result = await response.json();
                  
                  if (result.success) {
                    currentJoke = result.data;
                    document.getElementById('joke-content').textContent = result.data.text;
                    document.title = \`PunPal - \${result.data.text.substring(0, 50)}...\`;
                  }
                }
              } catch (error) {
                console.error('Failed to load joke:', error);
              }
            }
            
            async function shareJoke(platform) {
              if (!currentJoke) return;
              
              try {
                const response = await fetch(\`/api/share/\${platform}\`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ joke_id: currentJoke.id })
                });
                
                const result = await response.json();
                
                if (result.success && result.data.shareUrl) {
                  window.open(result.data.shareUrl, '_blank', 'width=600,height=400');
                }
              } catch (error) {
                console.error('Share failed:', error);
              }
            }
            
            async function copyJoke() {
              if (!currentJoke) return;
              
              try {
                const text = \`\${currentJoke.text}\\n\\nShared from PunPal: \${window.location.href}\`;
                await navigator.clipboard.writeText(text);
                alert('Joke copied to clipboard!');
              } catch (error) {
                console.error('Copy failed:', error);
              }
            }
            
            // Load joke on page load
            loadJoke();
          </script>
        </body>
        </html>
      `);
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({ 
        success: false, 
        error: 'Endpoint not found' 
      });
    });
  }

  /**
   * Set up error handling
   * @private
   */
  setupErrorHandling() {
    this.app.use((error, req, res, next) => {
      console.error('Express error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    });
  }

  /**
   * Get or create user from request
   * @param {Object} req - Express request
   * @returns {User} User instance
   * @private
   */
  getUserFromRequest(req) {
    // In a real app, this would handle authentication
    // For demo purposes, create an anonymous user
    const userId = req.headers['x-user-id'] || 'anonymous';
    
    return new User(userId, {
      safetyLevel: req.headers['x-safety-level'] || 'family-friendly',
      categories: req.headers['x-categories'] ? req.headers['x-categories'].split(',') : [],
      excludeCategories: req.headers['x-exclude-categories'] ? req.headers['x-exclude-categories'].split(',') : []
    });
  }

  /**
   * Start the server
   * @returns {Promise<void>}
   */
  async start() {
    try {
      // Initialize the controller
      await this.controller.initialize();
      
      // Start the server
      return new Promise((resolve, reject) => {
        this.server = this.app.listen(this.config.port, this.config.host, (error) => {
          if (error) {
            reject(error);
          } else {
            console.log(`🚀 PunPal Server running at http://${this.config.host}:${this.config.port}`);
            console.log(`📋 API Documentation:`);
            console.log(`   GET  /api/daily          - Get daily joke`);
            console.log(`   GET  /api/random         - Get random joke`);
            console.log(`   GET  /api/search?q=...   - Search jokes`);
            console.log(`   GET  /api/categories     - Get categories`);
            console.log(`   POST /api/share/:platform- Share joke`);
            console.log(`   GET  /health             - Health check`);
            console.log(`📖 Try: curl http://${this.config.host}:${this.config.port}/api/random`);
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      throw error;
    }
  }

  /**
   * Stop the server
   * @returns {Promise<void>}
   */
  async stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('PunPal Server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Export server class
export { PunPalServer };

// Auto-start if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new PunPalServer({
    port: process.env.PORT || 3000,
    enableAI: false
  });
  
  server.start().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    server.stop().then(() => process.exit(0));
  });
  
  process.on('SIGINT', () => {
    server.stop().then(() => process.exit(0));
  });
}

/*
---

What did the server say to the client? "You've got requests!"
*/