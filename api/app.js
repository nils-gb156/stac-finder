const express = require('express');
const app = express();
const collectionsRouter = require('./routes/collections');
const healthRouter = require('./routes/health');
const pagesRouter = require('./routes/pages');
const queryablesRouter = require('./routes/queryables');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/', pagesRouter);
app.use('/collections', collectionsRouter);
app.use('/health', healthRouter);
app.use('/queryables', queryablesRouter);

module.exports = app;