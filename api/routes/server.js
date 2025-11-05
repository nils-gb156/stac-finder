const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const host = '0.0.0.0';

// providing static files from the web UI
app.use(express.static(path.join(__dirname, '../web-ui')));

// integrate routes
const pagesRouter = require('./pages');
app.use('/', pagesRouter);

// start server
app.listen(port, host, () => {
  console.log(`Server läuft auf http://${host}:${port}`);
});
