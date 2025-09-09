// JavaScript Pro Agent Test
// This file demonstrates modern JavaScript features that the JavaScript Pro agent should handle

/**
 * Modern ES6+ JavaScript example with async patterns
 * Demonstrates destructuring, async/await, modules, and error handling
 */

// ES6+ Destructuring and Classes
class AsyncDataProcessor {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.cache = new Map();
    }

    // Async/await pattern with proper error handling
    async fetchUserData(userId) {
        try {
            if (this.cache.has(userId)) {
                return this.cache.get(userId);
            }

            const response = await fetch(`${this.apiUrl}/users/${userId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const userData = await response.json();
            
            // ES6 destructuring
            const { id, name, email, ...metadata } = userData;
            
            const processedData = {
                id,
                name,
                email,
                metadata,
                fetchedAt: new Date().toISOString()
            };

            this.cache.set(userId, processedData);
            return processedData;

        } catch (error) {
            console.error('Error fetching user data:', error.message);
            throw error;
        }
    }

    // Generator function for async iteration
    async* batchProcess(userIds) {
        for (const userId of userIds) {
            try {
                const userData = await this.fetchUserData(userId);
                yield userData;
            } catch (error) {
                yield { error: error.message, userId };
            }
        }
    }

    // Promise-based method with race condition prevention
    async processUsers(userIds, timeout = 5000) {
        const promises = userIds.map(id => this.fetchUserData(id));
        
        try {
            return await Promise.allSettled(
                promises.map(promise => 
                    Promise.race([
                        promise,
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Timeout')), timeout)
                        )
                    ])
                )
            );
        } catch (error) {
            throw new Error(`Batch processing failed: ${error.message}`);
        }
    }
}

// Module exports (ES6 modules)
export { AsyncDataProcessor };
export default AsyncDataProcessor;

// Example usage with top-level await (modern JS)
const processor = new AsyncDataProcessor('https://api.example.com');

// Functional pattern with arrow functions
const getUserSummary = async (userId) => {
    const userData = await processor.fetchUserData(userId);
    return `${userData.name} (${userData.email})`;
};

export { getUserSummary };