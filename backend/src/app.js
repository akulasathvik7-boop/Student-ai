const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const { rateLimit } = require("express-rate-limit");
const { config } = require("./config");
const { errorHandler } = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

function createApp() {
  const app = express();

  // Trust proxy if we are behind a reverse proxy (like Nginx/Vercel)
  app.set("trust proxy", 1);

  // Security Hardening: Helmet with strict Content Security Policy and HSTS
  app.use(helmet());
  app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Required for serving media file buffers securely
  // Disable X-Powered-By header (Helmet usually handles this but making it explicit)
  app.disable("x-powered-by");

  // Security Hardening: Strict CORS
  app.use(
    cors({
      origin: config.clientUrl,
      credentials: true, // required for httpOnly cookies
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // Logging
  app.use(morgan("dev"));

  // Security Hardening: Ensure upload directory exists before serving it
  const uploadPath = path.join(process.cwd(), config.uploadDir);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  // Serve static files (Notes PDFs)
  app.use("/uploads", express.static(uploadPath));

  // Rate Limiting: General API requests (100 req per hour)
  const apiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { message: "Too many requests from this IP, please try again after an hour" } }
  });

  // Rate Limiting: Auth routes specifically (5 req per minute)
  const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { message: "Too many login/register attempts. Please try again after a minute" } }
  });

  // Apply general limiter to /api
  app.use("/api", apiLimiter);

  // Health check routing
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "campusprep-backend" });
  });

  // Routes integration
  app.use("/api/auth", authLimiter, authRoutes);
  app.use("/api/notes", noteRoutes);
  app.use("/api/interviews", interviewRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

