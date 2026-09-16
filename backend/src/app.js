const express = require('express');
const cors = require('cors');
const gatewayRouter = require('./gateway/router');

// Register cross-app event subscriptions at cold-start / module load time
require('./apps/projects/projects.events');
require('./apps/tasks/tasks.events');
require('./apps/accounts/accounts.events');

const app = express();

// Request logging middleware (very early, before routes and CORS)
app.use((req, res, next) => {
  const origin = req.headers.origin || 'no-origin';
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl || req.url} | Origin: ${origin}`);
  next();
});

// Configure CORS: read CORS_ORIGIN as comma-separated list, allow no-origin and any origin in list
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no Origin header (for tools like curl/Postman)
    if (!origin) {
      return callback(null, true);
    }
    // Allow any origin in the configured comma-separated list (or all if empty)
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Mount the gateway router
app.use('/api', gatewayRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = app;
