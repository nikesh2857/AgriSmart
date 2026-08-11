import getRedis from '../src/backend/config/redis';
const redis = getRedis();
redis.del('recommendation_rules').then(() => {
  console.log('Cache cleared!');
  process.exit(0);
});
