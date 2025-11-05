const express = require('express');
const path = require('path');
const pagesRouter = require('./routes/pages');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', pagesRouter);

app.use((req, res, next) => {
  res.status(404).send('Seite nicht gefunden');
});

module.exports = app;