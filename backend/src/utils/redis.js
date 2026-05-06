const Redis = require('ioredis');
const config = require('../config');
const logger = require('./logger');

let client = null;

const getRedis = () => {
  if (!config.redis.enabled) return null;
  if (!client) {
    client = new Redis(config.redis.url, { lazyConnect: true, maxRetriesPerRequest: 1 });
    client.on('error', (err) => logger.warn('Redis error:', err.message));
  }
  return client;
};

const cacheGet = async (key) => {
  const redis = getRedis();
  if (!redis) return null;
  try { return JSON.parse(await redis.get(key)); } catch { return null; }
};

const cacheSet = async (key, value, ttlSecs = 300) => {
  const redis = getRedis();
  if (!redis) return;
  try { await redis.setex(key, ttlSecs, JSON.stringify(value)); } catch { /* silent */ }
};

const cacheDel = async (key) => {
  const redis = getRedis();
  if (!redis) return;
  try { await redis.del(key); } catch { /* silent */ }
};

module.exports = { cacheGet, cacheSet, cacheDel };
