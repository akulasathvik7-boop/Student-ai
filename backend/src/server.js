const http = require("http");
const mongoose = require("mongoose");
const { config } = require("./config");
const { createApp } = require("./app");

const PORT = config.port;

async function start() {
  const app = createApp();
  const server = http.createServer(app);

  try {
    // Explicit Database connection implementation (db.js equivalent)
    mongoose.set("strictQuery", true);
    await mongoose.connect(config.mongoUri, {
      dbName: config.mongoDbName,
      serverSelectionTimeoutMS: 5000,
      autoIndex: process.env.NODE_ENV !== "production", // Don't build indexes in prod automatically
    });
    // eslint-disable-next-line no-console
    console.log(`[Database] Successfully connected to MongoDB Database: ${config.mongoDbName}`);

    mongoose.connection.on("error", (err) => {
      console.error("[Database] Runtime MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("[Database] MongoDB disconnected. Attempting to reconnect...");
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[Database] Initial MongoDB connection failed. Exiting...", err);
    process.exit(1);
  }

  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`CampusPrep backend listening on port ${PORT}`);
  });

  process.on("unhandledRejection", (reason) => {
    // eslint-disable-next-line no-console
    console.error("Unhandled Rejection:", reason);
  });

  process.on("uncaughtException", (err) => {
    // eslint-disable-next-line no-console
    console.error("Uncaught Exception:", err);
  });
}

start();

