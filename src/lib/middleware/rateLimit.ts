// File: lib/middleware/rate-limit.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { LRUCache } from 'lru-cache';

// Setup an in-memory cache for development - for production, consider Redis
const tokenCache = new LRUCache({
  max: 500, // Maximum number of items to store
  ttl: 60 * 1000, // 1 minute (adjust as needed)
});

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  limit: 10, // maximum requests per windowMs
  windowMs: 60 * 1000, // 1 minute
};

export function withRateLimit(
  handler: Function,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT_CONFIG,
) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    // Get the IP address from trusted headers or request
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown';

    // Create a token based on IP and requested route
    const token = `${ip}:${req.url}`;

    // Get current count for this token
    const tokenCount = (tokenCache.get(token) as number) || 0;

    // Check if rate limit is reached
    if (tokenCount >= config.limit) {
      res.setHeader('Retry-After', Math.ceil(config.windowMs / 1000));
      res.setHeader('X-RateLimit-Limit', config.limit);
      res.setHeader('X-RateLimit-Remaining', 0);
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.',
      });
    }

    // Increment the count
    tokenCache.set(token, tokenCount + 1);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', config.limit);
    res.setHeader('X-RateLimit-Remaining', config.limit - (tokenCount + 1));

    // Continue to the handler
    return handler(req, res);
  };
}
