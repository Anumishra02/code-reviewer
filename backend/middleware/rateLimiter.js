// Simple in-memory rate limiter
// 10 requests per minute per IP
const requests = new Map();

const WINDOW_MS   = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

function rateLimiter(req, res, next) {
  const ip  = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();

  if (!requests.has(ip)) {
    requests.set(ip, { count: 1, startTime: now });
    return next();
  }

  const data = requests.get(ip);

  // Reset window if expired
  if (now - data.startTime > WINDOW_MS) {
    requests.set(ip, { count: 1, startTime: now });
    return next();
  }

  // Increment count
  data.count += 1;

  if (data.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - data.startTime)) / 1000);
    return res.status(429).json({
      error: `Rate limit exceeded. You can make ${MAX_REQUESTS} reviews per minute.`,
      retryAfter: `${retryAfter} seconds`
    });
  }

  next();
}

// Clean up old entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requests.entries()) {
    if (now - data.startTime > WINDOW_MS) {
      requests.delete(ip);
    }
  }
}, 5 * 60 * 1000);

module.exports = rateLimiter;
