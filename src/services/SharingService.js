/**
 * Service for handling social sharing functionality
 * Supports multiple platforms with proper error handling
 */
export class SharingService {
  /**
   * Initialize sharing service
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'https://punpal.app';
    this.appName = options.appName || 'PunPal';
    this.supportedPlatforms = [
      'twitter',
      'facebook', 
      'whatsapp',
      'email',
      'copy'
    ];
  }

  /**
   * Share a joke to a specific platform
   * @param {Object} joke - Joke object to share
   * @param {string} platform - Target platform
   * @param {Object} options - Additional sharing options
   * @returns {Promise<Object>} Sharing result
   */
  async shareJoke(joke, platform, options = {}) {
    try {
      if (!joke || !joke.text) {
        throw new Error('Invalid joke object');
      }

      if (!this.supportedPlatforms.includes(platform)) {
        throw new Error(`Unsupported platform: ${platform}`);
      }

      const shareData = this.prepareShareData(joke, options);
      
      switch (platform) {
        case 'twitter':
          return await this.shareToTwitter(shareData);
        case 'facebook':
          return await this.shareToFacebook(shareData);
        case 'whatsapp':
          return await this.shareToWhatsApp(shareData);
        case 'email':
          return await this.shareToEmail(shareData);
        case 'copy':
          return await this.copyToClipboard(shareData);
        default:
          throw new Error(`Handler not implemented for platform: ${platform}`);
      }
    } catch (error) {
      throw new Error(`Failed to share joke: ${error.message}`);
    }
  }

  /**
   * Generate a shareable link for a joke
   * @param {Object} joke - Joke object
   * @param {Object} options - Link options
   * @returns {Promise<string>} Shareable URL
   */
  async generateShareableLink(joke, options = {}) {
    try {
      const {
        utm_source: utmSource = 'share',
        utm_medium: utmMedium = 'social',
        utm_campaign: utmCampaign = 'joke_share'
      } = options;
      
      const params = new URLSearchParams({
        joke_id: joke.id,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign
      });

      return `${this.baseUrl}/joke?${params.toString()}`;
    } catch (error) {
      throw new Error(`Failed to generate shareable link: ${error.message}`);
    }
  }

  /**
   * Create a joke card image for sharing (mock implementation)
   * @param {Object} joke - Joke object
   * @param {Object} options - Card styling options
   * @returns {Promise<string>} Image URL or data URL
   */
  async generateJokeCard(joke, options = {}) {
    try {
      const {
        width = 600,
        height = 400,
        backgroundColor = '#f8f9fa',
        textColor = '#333333',
        fontSize = 24
      } = options;

      // In a real implementation, this would generate an actual image
      // For now, we'll return a mock data URL
      const canvas = this.createMockCanvas(joke, {
        width,
        height,
        backgroundColor,
        textColor,
        fontSize
      });

      return canvas;
    } catch (error) {
      throw new Error(`Failed to generate joke card: ${error.message}`);
    }
  }

  /**
   * Get sharing statistics
   * @param {number} jokeId - Joke ID
   * @returns {Promise<Object>} Sharing statistics
   */
  async getSharingStats(jokeId) {
    try {
      // Mock implementation - in a real app, this would query a database
      return {
        jokeId,
        totalShares: Math.floor(Math.random() * 100),
        sharesByPlatform: {
          twitter: Math.floor(Math.random() * 30),
          facebook: Math.floor(Math.random() * 25),
          whatsapp: Math.floor(Math.random() * 35),
          email: Math.floor(Math.random() * 10)
        },
        lastShared: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to get sharing stats: ${error.message}`);
    }
  }

  /**
   * Prepare share data with proper formatting
   * @param {Object} joke - Joke object
   * @param {Object} options - Share options
   * @returns {Object} Formatted share data
   * @private
   */
  prepareShareData(joke, options = {}) {
    const { includeAttribution = true, customMessage = '' } = options;
    
    const { text } = joke;
    let shareText = text;
    
    if (customMessage) {
      shareText = `${customMessage}\n\n${shareText}`;
    }
    
    if (includeAttribution) {
      shareText = `${shareText}\n\n😄 Shared from ${this.appName}`;
    }

    return {
      text: shareText.trim(),
      url: options.url || this.baseUrl,
      joke,
      hashtags: ['dadjokes', 'humor', 'punpal'],
      subject: `Hilarious Dad Joke from ${this.appName}`
    };
  }

  /**
   * Share to Twitter/X
   * @param {Object} shareData - Prepared share data
   * @returns {Promise<Object>} Share result
   * @private
   */
  async shareToTwitter(shareData) {
    try {
      const tweetText = this.truncateForTwitter(shareData.text);
      const hashtags = shareData.hashtags.join(',');
      
      const twitterUrl = new URL('https://twitter.com/intent/tweet');
      twitterUrl.searchParams.set('text', tweetText);
      twitterUrl.searchParams.set('hashtags', hashtags);
      twitterUrl.searchParams.set('url', shareData.url);

      return {
        success: true,
        platform: 'twitter',
        shareUrl: twitterUrl.toString(),
        method: 'popup'
      };
    } catch (error) {
      throw new Error(`Twitter share failed: ${error.message}`);
    }
  }

  /**
   * Share to Facebook
   * @param {Object} shareData - Prepared share data
   * @returns {Promise<Object>} Share result
   * @private
   */
  async shareToFacebook(shareData) {
    try {
      const facebookUrl = new URL('https://www.facebook.com/sharer/sharer.php');
      facebookUrl.searchParams.set('u', shareData.url);
      facebookUrl.searchParams.set('quote', shareData.text);

      return {
        success: true,
        platform: 'facebook',
        shareUrl: facebookUrl.toString(),
        method: 'popup'
      };
    } catch (error) {
      throw new Error(`Facebook share failed: ${error.message}`);
    }
  }

  /**
   * Share to WhatsApp
   * @param {Object} shareData - Prepared share data
   * @returns {Promise<Object>} Share result
   * @private
   */
  async shareToWhatsApp(shareData) {
    try {
      const whatsappUrl = new URL('https://wa.me/');
      const fullText = `${shareData.text}\n${shareData.url}`;
      whatsappUrl.searchParams.set('text', fullText);

      return {
        success: true,
        platform: 'whatsapp',
        shareUrl: whatsappUrl.toString(),
        method: 'redirect'
      };
    } catch (error) {
      throw new Error(`WhatsApp share failed: ${error.message}`);
    }
  }

  /**
   * Share via email
   * @param {Object} shareData - Prepared share data
   * @returns {Promise<Object>} Share result
   * @private
   */
  async shareToEmail(shareData) {
    try {
      const emailUrl = new URL('mailto:');
      emailUrl.searchParams.set('subject', shareData.subject);
      emailUrl.searchParams.set('body', `${shareData.text}\n\n${shareData.url}`);

      return {
        success: true,
        platform: 'email',
        shareUrl: emailUrl.toString(),
        method: 'redirect'
      };
    } catch (error) {
      throw new Error(`Email share failed: ${error.message}`);
    }
  }

  /**
   * Copy to clipboard using modern Clipboard API
   * @param {Object} shareData - Prepared share data
   * @returns {Promise<Object>} Share result
   * @private
   */
  async copyToClipboard(shareData) {
    try {
      const textToCopy = `${shareData.text}\n${shareData.url}`;
      
      // Use modern Clipboard API if available
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older browsers
        this.fallbackCopyToClipboard(textToCopy);
      }

      return {
        success: true,
        platform: 'copy',
        message: 'Joke copied to clipboard!',
        method: 'clipboard'
      };
    } catch (error) {
      throw new Error(`Copy to clipboard failed: ${error.message}`);
    }
  }

  /**
   * Fallback clipboard copy for older browsers
   * @param {string} text - Text to copy
   * @private
   */
  fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
    } finally {
      document.body.removeChild(textArea);
    }
  }

  /**
   * Truncate text for Twitter's character limit
   * @param {string} text - Original text
   * @returns {string} Truncated text
   * @private
   */
  truncateForTwitter(text) {
    const maxLength = 240; // Conservative limit accounting for URLs
    
    if (text.length <= maxLength) {
      return text;
    }
    
    return `${text.substring(0, maxLength - 3)}...`;
  }

  /**
   * Create mock canvas for joke card (placeholder)
   * @param {Object} joke - Joke object
   * @param {Object} options - Canvas options
   * @returns {string} Mock data URL
   * @private
   */
  /**
   * Create mock canvas for joke card (placeholder)
   * @param {Object} joke - Joke object
   * @param {Object} options - Canvas options
   * @returns {string} Mock data URL
   * @private
   */
  createMockCanvas(joke, options) {
    // In a real implementation, this would use Canvas API or server-side image generation
    // For now, return a placeholder data URL
    const svgContent = `
      <svg width="${options.width}" height="${options.height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${options.backgroundColor}"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${options.fontSize}" 
              fill="${options.textColor}" text-anchor="middle" dominant-baseline="middle">
          ${this.escapeXml(joke.text.substring(0, 100))}
        </text>
        <text x="50%" y="90%" font-family="Arial, sans-serif" font-size="16" 
              fill="#666" text-anchor="middle">
          ${this.appName}
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
  }

  /**
   * Escape XML special characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   * @private
   */
  escapeXml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Check if a platform is supported
   * @param {string} platform - Platform name
   * @returns {boolean} True if supported
   */
  isPlatformSupported(platform) {
    return this.supportedPlatforms.includes(platform);
  }

  /**
   * Get list of supported platforms
   * @returns {Array<string>} Supported platforms
   */
  getSupportedPlatforms() {
    return [...this.supportedPlatforms];
  }
}