require("dotenv").config();

const config = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGODB_URI,
  mongoDbName: process.env.MONGODB_DB,
  jwtSecret: process.env.JWT_SECRET,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  openAiApiKey: process.env.OPENAI_API_KEY,
  uploadDir: process.env.UPLOAD_DIR || "uploads",
};

// Security Hardening: Fail fast on startup if critical secrets are missing
if (!config.jwtSecret) {
  console.error("[SECURITY_ERROR] JWT_SECRET is not set. Terminating server.");
  process.exit(1);
}

if (!config.mongoUri || !config.mongoDbName) {
  console.error("[SECURITY_ERROR] MONGODB_URI and MONGODB_DB must be set. Terminating server.");
  process.exit(1);
}

if (!config.openAiApiKey) {
  console.error("[SECURITY_ERROR] OPENAI_API_KEY is not set. Terminating server.");
  process.exit(1);
}

module.exports = { config };

