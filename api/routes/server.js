const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const host = '0.0.0.0';

// Middleware
app.use(express.json());

// Static files from Web UI
app.use(express.static(path.join(__dirname, '../../web-ui')));

// Web UI pages
const pagesRouter = require('./pages');
app.use('/', pagesRouter);

// API routes
const collectionsRouter = require('./collections');
app.use('/collections', collectionsRouter);

const queryablesRouter = require('./queryables');
app.use('/collections/queryables', queryablesRouter);

// Health check route
const healthRouter = require('./health');
app.use('/health', healthRouter);

// Start server
app.listen(port, host, () => {
  console.log(`Server läuft auf http://${host}:${port}`);
});
