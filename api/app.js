const express = require('express');
const path = require('path');
const app = express();
const collectionsRouter = require('./routes/collections');
const healthRouter = require('./routes/health');
const pagesRouter = require('./routes/pages');
const queryablesRouter = require('./routes/queryables');
const { morganMiddleware, requestLogger } = require('./middleware/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Logging Middleware
app.use(morganMiddleware);
app.use(requestLogger);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static files from Web UI
app.use(express.static(path.join(__dirname, '../web-ui')));

// Routes
app.use('/', pagesRouter);
app.use('/collections', collectionsRouter);
app.use('/collections/queryables', queryablesRouter);
app.use('/health', healthRouter);

// Error Handling (am Ende!)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;