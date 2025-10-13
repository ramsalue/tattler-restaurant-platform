// src/middleware/cache.js

// This is a simple in-memory cache. 
class Cache {
  constructor() {
    this.cache = new Map();
    this.ttl = 300000;   // Time To Live: 5 minutes in milliseconds
  }

  // Creates a unique key for each request based on its URL and query parameters.
  generateKey(req) {
    return `${req.path}?${JSON.stringify(req.query)}`;
  }

  // Gets data from the cache. Returns null if not found or expired.
  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if the cached item has expired.
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  // Stores data in the cache with an expiry timestamp.
  set(key, data) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.ttl
    });
  }

  // Clears cache entries that match a certain pattern.
  // This is used to clear all 'restaurants' cache when data changes.
  clearPattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

const cache = new Cache();

// The middleware function for caching GET requests.
const cacheMiddleware = (req, res, next) => {
  const key = cache.generateKey(req);
  const cachedResponse = cache.get(key);

  if (cachedResponse) {
    console.log(`Cache HIT for key: ${key}`);
    return res.status(200).json(cachedResponse); // Return cached data immediately.
  }

  console.log(`Cache MISS for key: ${key}`);

  // Clever trick: Override the original res.json function.
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    // When the controller calls res.json(), It first store the data in this cache...
    cache.set(key, data);
    //Then call the original function to send the response.
    return originalJson(data);
  };

  next();
};

// Middleware to clear the cache when data is modified (POST, PUT, DELETE).
const clearCacheOnModify = (req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    // Clear any cached results related to restaurants.
    cache.clearPattern('/api/v1/restaurants');
    console.log(' Cache cleared due to data modification.');
  }
  next();
};

module.exports = { cacheMiddleware, clearCacheOnModify };