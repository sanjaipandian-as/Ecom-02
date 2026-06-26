import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { existsSync, mkdirSync } from "fs";

import connectDB from "./config/db.js";

// =========================
// ⭐ Load Environment Variables & Connect DB
// =========================
dotenv.config({ override: true });
connectDB();

const app = express();

// =========================
// ⭐ Uploads Directory Verification
// =========================
const UPLOADS_ROOT = process.env.UPLOADS_ROOT || './uploads';
const requiredDirs = ['products', 'categories', 'hero', 'tmp'].map(d => path.join(UPLOADS_ROOT, d));

for (const dir of [UPLOADS_ROOT, ...requiredDirs]) {
  if (!existsSync(dir)) {
    try {
      mkdirSync(dir, { recursive: true });
      console.log(`📁 Created uploads directory: ${dir}`);
    } catch (err) {
      console.error(`❌ Failed to create uploads directory: ${dir}`, err.message);
      console.error('   Check UPLOADS_ROOT in .env and filesystem permissions.');
      process.exit(1);
    }
  }
}
console.log(`✅ Uploads root verified: ${path.resolve(UPLOADS_ROOT)}`);

// =========================
// ⭐ Middlewares
// =========================
app.set('trust proxy', 1); // Respect proxy headers (important for Render/Vercel)

app.use(
  cors({
    origin: true,
    credentials: true,
    optionsSuccessStatus: 200
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

// 1. JSON & URL Encoded Payload Size Limiting (Prevents large payload attacks)
// MUST be before sanitization to populate req.body
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ limit: '50kb', extended: true }));

// Express 5 Security Middleware (Fixes Compatibility with Read-Only Getters)
// Replaces express-mongo-sanitize and xss-clean by sanitizing in-place
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return;

    Object.keys(obj).forEach(key => {
      // 1. Prototype Pollution Protection
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        delete obj[key];
        return;
      }

      // 2. NoSQL Injection Protection: Prevent keys starting with $ or containing .
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
        return;
      }

      let value = obj[key];

      // 3. Recursive Sanitization for Nested Objects
      if (value && typeof value === 'object') {
        sanitize(value);
      }
      // 4. XSS Protection for Strings (Advanced)
      else if (typeof value === 'string') {
        obj[key] = value
          // Remove scripts and anything inside (handles whitespace/newlines in tags)
          .replace(/<script[^>]*>[\s\S]*?<\/script\s*>/gi, '')
          // Remove dangerous HTML execution vectors
          .replace(/<\/?(?:iframe|object|embed|link)[^>]*>/gi, '')
          // Remove inline event handlers (supporting double/single/no quotes)
          .replace(/on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]*)/gi, '')
          // Remove javascript: and data: URIs
          .replace(/(?:javascript|data)\s*:\s*[^\s"'>]*/gi, '');
      }
    });
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
});

// 2. Global Burst Limiter (Anti-DDoS)
// Limits to 100 requests every 1 minute to prevent traffic spikes from taking the system down
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: "Service is receiving high traffic. Please try again in 1 minute.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", globalLimiter);

// 3. Auth Limiter (Brute Force Protection)
// Adjusted for better UX: 15 attempts every 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: "Too many login/register attempts. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/admin/auth/login", authLimiter);
app.use("/api/customer/auth/login", authLimiter);
app.use("/api/admin/auth/register", authLimiter); // Protect registration too
app.use("/api/customer/auth/register", authLimiter);

// Disable Express signature in production
if (process.env.NODE_ENV === "production") {
  app.disable("x-powered-by");
}

// =========================
// ⭐ ROUTE IMPORTS
// =========================
import customerAuthRoutes from "./routes/customerAuthRoutes.js";

import productRoutes from "./routes/productRoutes.js";
import customerProductRoutes from "./routes/customerProductRoutes.js";

import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";



import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminProductRoutes from "./routes/adminProductRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import adminAnalyticsRoutes from "./routes/adminAnalyticsRoutes.js";

import addressRoutes from "./routes/addressRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";

import notificationRoutes from "./routes/notificationRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";


// =========================
// ⭐ ADMIN ROUTES
// =========================
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);




// =========================
// ⭐ CUSTOMER ROUTES
// =========================
app.use("/api/customer/auth", customerAuthRoutes);
app.use("/api/products/customer", customerProductRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

// Hero Section Routes
import heroRoutes from "./routes/heroRoutes.js";
app.use("/api/hero", heroRoutes);


// =========================
// ⭐ GLOBAL ROUTES (USED BY ALL)
// =========================
app.use("/api/products", productRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/support", supportRoutes);


// =========================
// ⭐ Static File Serving (Development Only)
// =========================
// In production, Nginx serves /uploads/ directly from disk — Express never sees image requests.
// In development, we need Express to serve them since there's no Nginx.
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(UPLOADS_ROOT));
  console.log(`📂 Dev mode: serving uploads at /uploads from ${path.resolve(UPLOADS_ROOT)}`);
}

// =========================
// ⭐ DEFAULT ROUTE
// =========================
app.get("/", (req, res) => {
  res.json({ message: "🔥 Firecracker Marketplace API Running Successfully!" });
});


// =========================
// ⭐ GLOBAL ERROR HANDLER
// =========================
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error("=== Global Error Handler ===");
  console.error(err);

  if (err.name === "MulterError") {
    return res.status(400).json({
      message: "File upload error",
      error: err.message,
      code: err.code,
    });
  }

  return res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: err.name,
  });
});


// =========================
// ⭐ START SERVER
// =========================
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});

export default app;
