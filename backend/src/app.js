const express = require('express');
const cors = require('cors');
const gatewayRouter = require('./gateway/router');

const app = express();

app.use(cors());
app.use(express.json());

// Mount the gateway router
app.use('/api', gatewayRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = app;
