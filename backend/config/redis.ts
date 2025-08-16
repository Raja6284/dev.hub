import { createClient } from 'redis';

const redisClient = createClient({ 
  url: process.env.REDIS_URI || 'redis://localhost:6379',
  socket: {
    tls: process.env.REDIS_URI?.includes('rediss://'),
    rejectUnauthorized: false
  }
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redisClient.on('connect', () => {
  console.log('Redis connected');
});

// Connect to Redis
redisClient.connect().catch(console.error);

export { redisClient };