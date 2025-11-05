const express = require('express');
const path = require('path');
const router = express.Router();

// path to web-ui
const webUiPath = path.join(__dirname, '../../web-ui');

// route for homepage
router.get('/', (req, res) => {
  res.sendFile(path.join(webUiPath, 'index.html'));
});

module.exports = router;
