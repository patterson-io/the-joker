/**
 * Utility functions for the PunPal application
 * Includes async helpers, validation, and cross-platform utilities
 */

/**
 * Debounce function to limit rapid function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute on leading edge
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(this, args);
  };
};

/**
 * Throttle function to limit function execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Retry async operation with exponential backoff
 * @param {Function} operation - Async operation to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise<any>} Operation result
 */
export const retryWithBackoff = async (operation, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }
  
  throw lastError;
};

/**
 * Sleep/delay function using Promise
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize string for safe HTML output
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeHtml = (str) => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

/**
 * Format date in user-friendly format
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  const dateObj = new Date(date);
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return dateObj.toLocaleDateString('en-US', defaultOptions);
};

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
  if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  return 'Just now';
};

/**
 * Generate UUID v4
 * @returns {string} UUID string
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Deep clone object using structured cloning
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export const deepClone = (obj) => {
  try {
    // Use structuredClone if available (modern browsers)
    if (typeof structuredClone !== 'undefined') {
      return structuredClone(obj);
    }
    
    // Fallback to JSON methods
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    throw new Error(`Failed to clone object: ${error.message}`);
  }
};

/**
 * Check if code is running in browser environment
 * @returns {boolean} True if browser environment
 */
export const isBrowser = () => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

/**
 * Check if code is running in Node.js environment
 * @returns {boolean} True if Node.js environment
 */
export const isNode = () => {
  return typeof process !== 'undefined' && process.versions && process.versions.node;
};

/**
 * Get device/platform information
 * @returns {Object} Platform information
 */
export const getPlatformInfo = () => {
  if (!isBrowser()) {
    return {
      platform: 'node',
      userAgent: process.version,
      mobile: false
    };
  }
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  return {
    platform: 'browser',
    userAgent: navigator.userAgent,
    mobile: /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent),
    ios: /ipad|iphone|ipod/.test(userAgent),
    android: /android/.test(userAgent),
    chrome: /chrome/.test(userAgent),
    firefox: /firefox/.test(userAgent),
    safari: /safari/.test(userAgent) && !/chrome/.test(userAgent)
  };
};

/**
 * Local storage wrapper with error handling
 */
export class LocalStorageManager {
  /**
   * Set item in local storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @returns {Promise<boolean>} Success status
   */
  static async setItem(key, value) {
    try {
      if (!isBrowser()) {
        throw new Error('Local storage not available in Node.js environment');
      }
      
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to set local storage item: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Get item from local storage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key not found
   * @returns {Promise<any>} Stored value or default
   */
  static async getItem(key, defaultValue = null) {
    try {
      if (!isBrowser()) {
        return defaultValue;
      }
      
      const item = localStorage.getItem(key);
      
      if (item === null) {
        return defaultValue;
      }
      
      return JSON.parse(item);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to get local storage item: ${error.message}`);
      return defaultValue;
    }
  }
  
  /**
   * Remove item from local storage
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} Success status
   */
  static async removeItem(key) {
    try {
      if (!isBrowser()) {
        return false;
      }
      
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to remove local storage item: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Clear all local storage
   * @returns {Promise<boolean>} Success status
   */
  static async clear() {
    try {
      if (!isBrowser()) {
        return false;
      }
      
      localStorage.clear();
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to clear local storage: ${error.message}`);
      return false;
    }
  }
}

/**
 * Performance measurement utility
 */
export class PerformanceTracker {
  constructor() {
    this.marks = new Map();
    this.measures = new Map();
  }
  
  /**
   * Mark start of performance measurement
   * @param {string} name - Measurement name
   */
  mark(name) {
    this.marks.set(name, performance.now());
  }
  
  /**
   * Measure time since mark
   * @param {string} name - Measurement name
   * @returns {number} Duration in milliseconds
   */
  measure(name) {
    const startTime = this.marks.get(name);
    
    if (startTime === undefined) {
      throw new Error(`No mark found with name: ${name}`);
    }
    
    const duration = performance.now() - startTime;
    this.measures.set(name, duration);
    
    return duration;
  }
  
  /**
   * Get all measurements
   * @returns {Object} All measurements
   */
  getResults() {
    return Object.fromEntries(this.measures);
  }
  
  /**
   * Clear all marks and measures
   */
  clear() {
    this.marks.clear();
    this.measures.clear();
  }
}

/**
 * Event emitter for cross-component communication
 */
export class EventEmitter {
  constructor() {
    this.events = new Map();
  }
  
  /**
   * Subscribe to event
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    this.events.get(event).push(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }
  
  /**
   * Unsubscribe from event
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  off(event, callback) {
    const callbacks = this.events.get(event);
    
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
  
  /**
   * Emit event
   * @param {string} event - Event name
   * @param {...any} args - Event arguments
   */
  emit(event, ...args) {
    const callbacks = this.events.get(event);
    
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Error in event callback: ${error.message}`);
        }
      });
    }
  }
  
  /**
   * Remove all listeners for event
   * @param {string} event - Event name
   */
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}