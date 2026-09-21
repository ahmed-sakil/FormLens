import rateLimit from 'express-rate-limit';

const messageHandler = { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } };

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: messageHandler,
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: messageHandler,
});
