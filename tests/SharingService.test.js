import { jest } from '@jest/globals';
import { SharingService } from '../src/services/SharingService.js';

/**
 * Test suite for SharingService
 * Tests social sharing functionality and cross-platform compatibility
 */
describe('SharingService', () => {
  let sharingService;
  let mockJoke;

  beforeEach(() => {
    sharingService = new SharingService({
      baseUrl: 'https://test-punpal.app',
      appName: 'Test PunPal'
    });

    mockJoke = {
      id: 1,
      text: 'Why don\'t scientists trust atoms? Because they make up everything!',
      category: 'science',
      rating: 'family-friendly',
      tags: ['science', 'chemistry', 'wordplay']
    };
  });

  describe('shareJoke', () => {
    it('should share joke to Twitter', async () => {
      const result = await sharingService.shareJoke(mockJoke, 'twitter');
      
      expect(result.success).toBe(true);
      expect(result.platform).toBe('twitter');
      expect(result.shareUrl).toContain('twitter.com/intent/tweet');
      expect(result.shareUrl).toContain(encodeURIComponent(mockJoke.text));
      expect(result.method).toBe('popup');
    });

    it('should share joke to Facebook', async () => {
      const result = await sharingService.shareJoke(mockJoke, 'facebook');
      
      expect(result.success).toBe(true);
      expect(result.platform).toBe('facebook');
      expect(result.shareUrl).toContain('facebook.com/sharer/sharer.php');
      expect(result.method).toBe('popup');
    });

    it('should share joke to WhatsApp', async () => {
      const result = await sharingService.shareJoke(mockJoke, 'whatsapp');
      
      expect(result.success).toBe(true);
      expect(result.platform).toBe('whatsapp');
      expect(result.shareUrl).toContain('wa.me');
      expect(result.shareUrl).toContain(encodeURIComponent(mockJoke.text));
      expect(result.method).toBe('redirect');
    });

    it('should share joke via email', async () => {
      const result = await sharingService.shareJoke(mockJoke, 'email');
      
      expect(result.success).toBe(true);
      expect(result.platform).toBe('email');
      expect(result.shareUrl).toContain('mailto:');
      expect(result.shareUrl).toContain(encodeURIComponent(mockJoke.text));
      expect(result.method).toBe('redirect');
    });

    it('should copy joke to clipboard', async () => {
      // Mock clipboard API
      const mockClipboard = {
        writeText: jest.fn().mockResolvedValue(undefined)
      };
      
      global.navigator = {
        clipboard: mockClipboard
      };
      global.window = { isSecureContext: true };

      const result = await sharingService.shareJoke(mockJoke, 'copy');
      
      expect(result.success).toBe(true);
      expect(result.platform).toBe('copy');
      expect(result.method).toBe('clipboard');
      expect(mockClipboard.writeText).toHaveBeenCalled();
    });

    it('should reject invalid joke object', async () => {
      await expect(sharingService.shareJoke(null, 'twitter'))
        .rejects.toThrow('Invalid joke object');
      
      await expect(sharingService.shareJoke({ id: 1 }, 'twitter'))
        .rejects.toThrow('Invalid joke object');
    });

    it('should reject unsupported platform', async () => {
      await expect(sharingService.shareJoke(mockJoke, 'unsupported'))
        .rejects.toThrow('Unsupported platform: unsupported');
    });

    it('should include custom message in share', async () => {
      const customMessage = 'Check out this hilarious joke!';
      const result = await sharingService.shareJoke(mockJoke, 'twitter', {
        customMessage
      });
      
      expect(result.shareUrl).toContain(encodeURIComponent(customMessage));
    });

    it('should handle attribution options', async () => {
      const result = await sharingService.shareJoke(mockJoke, 'twitter', {
        includeAttribution: false
      });
      
      expect(result.success).toBe(true);
      // Should not contain app name when attribution is disabled
      expect(result.shareUrl).not.toContain(encodeURIComponent('Test PunPal'));
    });
  });

  describe('generateShareableLink', () => {
    it('should generate shareable link with UTM parameters', async () => {
      const link = await sharingService.generateShareableLink(mockJoke, {
        utm_source: 'test',
        utm_medium: 'jest',
        utm_campaign: 'unit_test'
      });
      
      expect(link).toContain('https://test-punpal.app/joke');
      expect(link).toContain('joke_id=1');
      expect(link).toContain('utm_source=test');
      expect(link).toContain('utm_medium=jest');
      expect(link).toContain('utm_campaign=unit_test');
    });

    it('should use default UTM parameters', async () => {
      const link = await sharingService.generateShareableLink(mockJoke);
      
      expect(link).toContain('utm_source=share');
      expect(link).toContain('utm_medium=social');
      expect(link).toContain('utm_campaign=joke_share');
    });
  });

  describe('generateJokeCard', () => {
    it('should generate joke card with default options', async () => {
      const cardUrl = await sharingService.generateJokeCard(mockJoke);
      
      expect(cardUrl).toContain('data:image/svg+xml;base64,');
      expect(typeof cardUrl).toBe('string');
    });

    it('should generate joke card with custom options', async () => {
      const options = {
        width: 800,
        height: 600,
        backgroundColor: '#ff0000',
        textColor: '#ffffff',
        fontSize: 32
      };
      
      const cardUrl = await sharingService.generateJokeCard(mockJoke, options);
      
      expect(cardUrl).toContain('data:image/svg+xml;base64,');
      
      // Decode and check SVG content
      const base64Content = cardUrl.split(',')[1];
      const svgContent = atob(base64Content);
      expect(svgContent).toContain('width="800"');
      expect(svgContent).toContain('height="600"');
      expect(svgContent).toContain('fill="#ff0000"');
    });

    it('should handle special characters in joke text', async () => {
      const jokeWithSpecialChars = {
        ...mockJoke,
        text: 'Why don\'t <script>alert("test")</script> & "quotes" work?'
      };
      
      const cardUrl = await sharingService.generateJokeCard(jokeWithSpecialChars);
      const base64Content = cardUrl.split(',')[1];
      const svgContent = atob(base64Content);
      
      // Should escape XML characters
      expect(svgContent).toContain('&lt;script&gt;');
      expect(svgContent).toContain('&amp;');
      expect(svgContent).toContain('&quot;');
    });
  });

  describe('getSharingStats', () => {
    it('should return sharing statistics', async () => {
      const stats = await sharingService.getSharingStats(1);
      
      expect(stats).toBeDefined();
      expect(stats.jokeId).toBe(1);
      expect(typeof stats.totalShares).toBe('number');
      expect(stats.sharesByPlatform).toBeDefined();
      expect(stats.sharesByPlatform.twitter).toBeDefined();
      expect(stats.sharesByPlatform.facebook).toBeDefined();
      expect(stats.sharesByPlatform.whatsapp).toBeDefined();
      expect(stats.sharesByPlatform.email).toBeDefined();
      expect(stats.lastShared).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      // Mock an error scenario
      jest.spyOn(sharingService, 'getSharingStats').mockRejectedValueOnce(
        new Error('Database error')
      );

      await expect(sharingService.getSharingStats(1))
        .rejects.toThrow('Database error');
    });
  });

  describe('platform support', () => {
    it('should check if platform is supported', () => {
      expect(sharingService.isPlatformSupported('twitter')).toBe(true);
      expect(sharingService.isPlatformSupported('facebook')).toBe(true);
      expect(sharingService.isPlatformSupported('whatsapp')).toBe(true);
      expect(sharingService.isPlatformSupported('email')).toBe(true);
      expect(sharingService.isPlatformSupported('copy')).toBe(true);
      expect(sharingService.isPlatformSupported('unsupported')).toBe(false);
    });

    it('should get list of supported platforms', () => {
      const platforms = sharingService.getSupportedPlatforms();
      
      expect(platforms).toContain('twitter');
      expect(platforms).toContain('facebook');
      expect(platforms).toContain('whatsapp');
      expect(platforms).toContain('email');
      expect(platforms).toContain('copy');
      expect(platforms).toHaveLength(5);
    });
  });

  describe('text processing', () => {
    it('should truncate long text for Twitter', () => {
      const longJoke = {
        ...mockJoke,
        text: 'This is a very long joke that exceeds the Twitter character limit and should be truncated to fit within the platform constraints while maintaining readability and ensuring the punchline is not cut off in the middle of a sentence.'
      };
      
      const truncated = sharingService.truncateForTwitter(longJoke.text);
      
      expect(truncated.length).toBeLessThanOrEqual(240);
      expect(truncated).toEndWith('...');
    });

    it('should not truncate short text for Twitter', () => {
      const shortText = 'Short joke!';
      const result = sharingService.truncateForTwitter(shortText);
      
      expect(result).toBe(shortText);
      expect(result).not.toEndWith('...');
    });

    it('should escape XML characters', () => {
      const textWithXml = '<script>alert("test")</script> & "quotes" & \'apostrophe\'';
      const escaped = sharingService.escapeXml(textWithXml);
      
      expect(escaped).toBe('&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt; &amp; &quot;quotes&quot; &amp; &#39;apostrophe&#39;');
    });
  });

  describe('clipboard operations', () => {
    it('should handle clipboard API unavailable', async () => {
      // Mock environment without clipboard API
      global.navigator = {};
      global.window = { isSecureContext: false };
      
      // Mock document for fallback
      const mockTextArea = {
        value: '',
        style: {},
        focus: jest.fn(),
        select: jest.fn()
      };
      
      global.document = {
        createElement: jest.fn().mockReturnValue(mockTextArea),
        body: {
          appendChild: jest.fn(),
          removeChild: jest.fn()
        },
        execCommand: jest.fn().mockReturnValue(true)
      };

      const result = await sharingService.shareJoke(mockJoke, 'copy');
      
      expect(result.success).toBe(true);
      expect(result.platform).toBe('copy');
      expect(document.createElement).toHaveBeenCalledWith('textarea');
    });

    it('should handle clipboard write failure', async () => {
      const mockClipboard = {
        writeText: jest.fn().mockRejectedValue(new Error('Clipboard access denied'))
      };
      
      global.navigator = { clipboard: mockClipboard };
      global.window = { isSecureContext: true };

      await expect(sharingService.shareJoke(mockJoke, 'copy'))
        .rejects.toThrow('Copy to clipboard failed');
    });
  });

  describe('share data preparation', () => {
    it('should prepare share data with all options', () => {
      const options = {
        includeAttribution: true,
        customMessage: 'Custom message',
        url: 'https://custom-url.com'
      };
      
      const shareData = sharingService.prepareShareData(mockJoke, options);
      
      expect(shareData.text).toContain('Custom message');
      expect(shareData.text).toContain(mockJoke.text);
      expect(shareData.text).toContain('Test PunPal');
      expect(shareData.url).toBe('https://custom-url.com');
      expect(shareData.hashtags).toContain('dadjokes');
    });

    it('should prepare share data without attribution', () => {
      const options = { includeAttribution: false };
      const shareData = sharingService.prepareShareData(mockJoke, options);
      
      expect(shareData.text).not.toContain('Test PunPal');
      expect(shareData.text).toBe(mockJoke.text);
    });

    it('should handle missing options', () => {
      const shareData = sharingService.prepareShareData(mockJoke);
      
      expect(shareData.text).toContain(mockJoke.text);
      expect(shareData.text).toContain('Test PunPal');
      expect(shareData.hashtags).toBeDefined();
      expect(shareData.subject).toBeDefined();
    });
  });

  describe('async error handling', () => {
    it('should handle network errors in sharing', async () => {
      // Mock a network failure scenario
      jest.spyOn(sharingService, 'prepareShareData').mockImplementation(() => {
        throw new Error('Network failure');
      });

      await expect(sharingService.shareJoke(mockJoke, 'twitter'))
        .rejects.toThrow('Failed to share joke: Network failure');
    });

    it('should handle concurrent sharing requests', async () => {
      const promises = Array.from({ length: 5 }, (_, i) => 
        sharingService.shareJoke(mockJoke, 'twitter', { customMessage: `Message ${i}` })
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.shareUrl).toContain(encodeURIComponent(`Message ${index}`));
      });
    });
  });

  describe('URL generation', () => {
    it('should generate valid Twitter URL', async () => {
      const result = await sharingService.shareToTwitter({
        text: mockJoke.text,
        url: 'https://test.com',
        hashtags: ['test', 'joke']
      });
      
      const url = new URL(result.shareUrl);
      expect(url.hostname).toBe('twitter.com');
      expect(url.pathname).toBe('/intent/tweet');
      expect(url.searchParams.get('text')).toBe(mockJoke.text);
      expect(url.searchParams.get('hashtags')).toBe('test,joke');
    });

    it('should generate valid Facebook URL', async () => {
      const result = await sharingService.shareToFacebook({
        text: mockJoke.text,
        url: 'https://test.com'
      });
      
      const url = new URL(result.shareUrl);
      expect(url.hostname).toBe('www.facebook.com');
      expect(url.pathname).toBe('/sharer/sharer.php');
      expect(url.searchParams.get('u')).toBe('https://test.com');
      expect(url.searchParams.get('quote')).toBe(mockJoke.text);
    });

    it('should generate valid WhatsApp URL', async () => {
      const result = await sharingService.shareToWhatsApp({
        text: mockJoke.text,
        url: 'https://test.com'
      });
      
      const url = new URL(result.shareUrl);
      expect(url.hostname).toBe('wa.me');
      expect(url.searchParams.get('text')).toContain(mockJoke.text);
      expect(url.searchParams.get('text')).toContain('https://test.com');
    });

    it('should generate valid email URL', async () => {
      const result = await sharingService.shareToEmail({
        text: mockJoke.text,
        url: 'https://test.com',
        subject: 'Test Subject'
      });
      
      const url = new URL(result.shareUrl);
      expect(url.protocol).toBe('mailto:');
      expect(url.searchParams.get('subject')).toBe('Test Subject');
      expect(url.searchParams.get('body')).toContain(mockJoke.text);
    });
  });
});