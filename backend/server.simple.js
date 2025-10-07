/**
 * Simple Server Entry Point (As per Prompt 2 Requirements)
 * 
 * This is a simplified version showing the exact pattern from the prompt.
 * The actual server.js has more robust error handling and graceful shutdown.
 */

import dotenv from "dotenv";
import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import redis from "./src/config/redis.js";
import { initSocket } from "./src/config/socket.js";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Connect to MongoDB
connectDB();

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// Note: The main server.js has additional features:
// - Redis connection waiting
// - Graceful shutdown handling
// - Better error handling
// - Process signal handlers
// Use the main server.js for production
