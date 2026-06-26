import rateLimit from 'express-rate-limit';

// 1. Password Change Limiter (Brute force protection on password modifications)
export const passwordChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    message: "Too many password change attempts. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. Support Ticket Limiter (Anti-spam for public support ticket creation)
export const supportTicketLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 tickets per hour per IP
  message: {
    message: "Too many support tickets created from this IP. Please try again in an hour."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. Search Limiter (Anti-DDoS/High resource usage query spam)
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 search requests per minute per IP
  message: {
    message: "Too many search requests. Please slow down and try again."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 4. Review Limiter (Anti-spam for posting reviews)
export const reviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 reviews/votes per 15 minutes
  message: {
    message: "Too many review submissions. Please wait a bit before trying again."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 5. Cart & Wishlist Limiter (Anti-spam for cart and wishlist DB writes/reads)
export const cartWishlistLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
  message: {
    message: "Too many cart or wishlist operations. Please wait a moment."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 6. SMTP/OTP Send Limiter (Prevents email spam/resource abuse)
export const emailOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per 15 minutes
  message: {
    message: "Too many OTP requests. Please wait 15 minutes before trying again."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
