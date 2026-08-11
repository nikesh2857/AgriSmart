import Redis from 'ioredis';

let redis: Redis;

const getRedis = (): Redis => {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    redis.on('error', (err) => {
      console.warn('[Redis] Connection error (caching disabled):', err.message);
    });
  }
  return redis;
};

export default getRedis;
