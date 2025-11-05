const express = require('express');
const path = require('path');
const router = express.Router();

// Pfad zu web-ui
const webUiPath = path.join(__dirname, '../../web-ui');

// Route für Startseite
router.get('/', (req, res) => {
  res.sendFile(path.join(webUiPath, 'index.html'));
});

module.exports = router;
