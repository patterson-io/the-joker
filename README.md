# PunPal - Your Daily Dad Joke Companion 🎭

A modern, cross-platform dad jokes application built with ES6+ JavaScript, featuring async/await patterns, proper error handling, and full cross-browser compatibility.

## Features 🚀

- **Daily Dad Jokes**: Curated, groan-worthy dad jokes delivered daily
- **Personalization**: User preferences and personalized recommendations
- **Gamification**: Daily streaks, achievements, and progress tracking
- **Social Sharing**: Share jokes across multiple platforms (Twitter, Facebook, WhatsApp, Email)
- **Search**: Find jokes by content, category, or tags
- **Cross-Platform**: Works in browsers, Node.js, and mobile environments
- **Modern JavaScript**: ES6+ features, async/await, proper error handling
- **Safety First**: Content filtering and family-friendly ratings
- **RESTful API**: Complete REST API for integration
- **Responsive Design**: Mobile-first, responsive web interface

## Architecture 🏗️

### Modern JavaScript Features
- **ES6+ Modules**: Clean import/export structure
- **Async/Await**: Promise-based async patterns throughout
- **Destructuring**: Object and array destructuring for cleaner code
- **Template Literals**: Dynamic string construction
- **Classes**: Object-oriented design patterns
- **Arrow Functions**: Consistent functional style
- **Spread Operator**: Immutable operations

### Core Components

#### Services
- **JokeService**: Manages joke retrieval, filtering, and personalization
- **SharingService**: Handles social sharing across platforms
- **User Model**: Manages user preferences, favorites, and gamification

#### Controllers
- **PunPalController**: Main application orchestrator
- **Express Server**: RESTful API server with comprehensive endpoints

#### Utilities
- **Helpers**: Cross-platform utilities, performance tracking, event handling
- **Local Storage**: Browser storage with graceful Node.js fallbacks
- **Error Handling**: Comprehensive error boundaries and logging

## Quick Start 🚀

### Installation
```bash
git clone https://github.com/patterson-io/the-joker.git
cd the-joker
npm install
```

### Run the Demo
```bash
npm start
```

### Start the API Server
```bash
npm run serve
```

### Development
```bash
npm run dev      # Start with watch mode
npm run lint     # Check code quality
npm run test     # Run test suite
npm run build    # Lint + test
```

## API Endpoints 📡

### Jokes
- `GET /api/daily` - Get daily personalized joke
- `GET /api/random` - Get random joke
- `GET /api/search?q=science` - Search jokes
- `GET /api/joke/:id` - Get specific joke
- `GET /api/categories` - Get available categories

### User
- `PUT /api/user/preferences` - Update user preferences
- `GET /api/user/stats` - Get user statistics
- `POST /api/user/favorite/:jokeId` - Toggle favorite

### Sharing
- `POST /api/share/:platform` - Generate share links
- `GET /api/stats/sharing/:jokeId` - Get sharing statistics

### Utility
- `GET /health` - Health check
- `GET /joke?joke_id=123` - Shareable joke page

## Usage Examples 💻

### Basic Usage
```javascript
import { PunPalApp } from './src/index.js';

const app = new PunPalApp();
const controller = await app.start();

// Get daily joke
const dailyJoke = await controller.getDailyJoke();
console.log(dailyJoke.text);

// Search jokes
const scienceJokes = await controller.searchJokes('science');

// Share a joke
const shareResult = await controller.shareJoke('twitter');
```

### API Integration
```bash
# Get a random joke
curl http://localhost:3000/api/random

# Search for programming jokes
curl "http://localhost:3000/api/search?q=programming"

# Get daily joke
curl http://localhost:3000/api/daily
```

### Browser Integration
```html
<!DOCTYPE html>
<html>
<head>
    <title>My App with PunPal</title>
</head>
<body>
    <div id="joke-container"></div>
    
    <script type="module">
        import { PunPalApp } from './src/index.js';
        
        const app = new PunPalApp();
        const controller = await app.start();
        
        const joke = await controller.getDailyJoke();
        document.getElementById('joke-container').textContent = joke.text;
    </script>
</body>
</html>
```

## Configuration ⚙️

### Application Options
```javascript
const app = new PunPalApp({
    enableAI: false,                    // Enable AI joke generation
    baseUrl: 'https://your-domain.com', // Base URL for sharing
    appName: 'Your App Name',           // App name in shares
    userStorageKey: 'custom_user_key',  // Local storage key
    cacheTimeout: 300000                // Cache timeout (ms)
});
```

### Server Options
```javascript
const server = new PunPalServer({
    port: 3000,                  // Server port
    host: 'localhost',           // Server host
    corsOrigin: '*',             // CORS origin
    enableAI: false              // Enable AI endpoints
});
```

## Features Deep Dive 🔍

### Personalization Engine
- **User Preferences**: Category preferences and exclusions
- **Viewing History**: Track jokes viewed and favorites
- **Smart Recommendations**: ML-style scoring for personalized content
- **Daily Streaks**: Gamified daily engagement tracking

### Content Safety
- **Family-Friendly**: All jokes rated for appropriate audiences
- **Content Filtering**: Configurable content safety filters
- **Quality Control**: Curated joke database with quality ratings

### Cross-Platform Support
- **Browser**: Full-featured web application
- **Node.js**: Server-side API and CLI tools
- **Mobile**: Responsive design optimized for mobile devices
- **PWA Ready**: Progressive Web App capabilities

### Performance Optimizations
- **Async Operations**: Non-blocking operations throughout
- **Caching**: Intelligent caching with configurable timeouts
- **Lazy Loading**: On-demand content loading
- **Error Boundaries**: Graceful error handling and recovery

## Browser Compatibility 🌐

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **ES Modules**: Native ES module support required
- **Fallbacks**: Graceful degradation for older browsers
- **Polyfills**: Optional polyfills for enhanced compatibility

## Development 🛠️

### Project Structure
```
src/
├── controllers/        # Application controllers
├── services/          # Business logic services  
├── models/            # Data models
├── utils/             # Utility functions
├── index.js           # Main application entry
└── server.js          # Express server

tests/                 # Jest test suites
public/                # Static web assets
```

### Code Style
- **ESLint**: Enforced code quality rules
- **Modern JS**: ES6+ features throughout
- **JSDoc**: Comprehensive documentation
- **Error Handling**: Proper async error boundaries
- **Performance**: Optimized operations and caching

### Testing
```bash
npm test              # Run full test suite
npm run test:watch    # Watch mode testing
npm run lint          # Code quality check
npm run lint:fix      # Auto-fix lint issues
```

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run `npm run build` to verify
5. Submit a pull request

### Code Guidelines
- Use modern JavaScript (ES6+)
- Follow async/await patterns
- Include JSDoc comments
- Add tests for new features
- Maintain cross-platform compatibility

## License 📄

MIT License - see LICENSE file for details.

## Credits 🙏

Built with modern JavaScript best practices and cross-platform compatibility in mind. Designed to be a reference implementation for:

- Modern async JavaScript patterns
- Cross-platform application development
- Clean architecture and separation of concerns
- Comprehensive error handling
- Progressive Web App development

---

*Keep spreading smiles, one dad joke at a time!* 😄

---

Why don't developers ever get lost? Because they always know their way around the DOM!