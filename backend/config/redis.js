const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.log('❌ Too many retries on Redis. Giving up.');
        return new Error('Too many retries');
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

redisClient.on('error', (err) => {
  if (err.code === 'ECONNREFUSED') {
    console.log('⚠️  Redis not available - continuing without cache');
  } else {
    console.log('Redis Client Error', err);
  }
});

redisClient.on('connect', () => console.log('✅ Redis Client Connected'));

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.log('⚠️  Redis connection failed - continuing without cache');
  }
};

// Cache middleware with better error handling
const cache = (duration = 3600) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;
    
    try {
      // Check if Redis is connected
      if (!redisClient.isOpen) {
        return next();
      }

      const cachedData = await redisClient.get(key);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      // Override res.json to cache response
      const originalJson = res.json;
      res.json = function(data) {
        if (redisClient.isOpen) {
          redisClient.setEx(key, duration, JSON.stringify(data)).catch(() => {
            // Silently fail if cache set fails
          });
        }
        originalJson.call(this, data);
      };

      next();
    } catch (error) {
      next(); // Continue without cache
    }
  };
};

module.exports = { redisClient, connectRedis, cache };