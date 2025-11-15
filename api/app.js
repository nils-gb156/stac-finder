const express = require('express');
const app = express();
const routes = require('./routes');

app.use('/', pagesRouter);

app.use(express.json());
app.use('/collections', routes.collections);

module.exports = app;