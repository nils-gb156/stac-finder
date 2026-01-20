const express = require('express');
const path = require('path');
const router = express.Router();

// path to public folder
const publicPath = path.join(__dirname, '../../public');

// Serves a minimal static HTML page as a lightweight UI for manual testing of the API endpoints
router.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

module.exports = router;
