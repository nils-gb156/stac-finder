const express = require('express');
const router = express.Router();

const db = require('../db'); // liegt unter /api/db/index.js

router.get('/', async (req, res) => {
  const timestamp = new Date().toISOString();

  const target = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
  };

  try {
    // leichter, schneller DB-Check
    await db.query('SELECT 1');

    return res.status(200).json({
      status: 'ok',
      api: 'up',
      database: 'up',
      target,
      timestamp
    });
  } catch (err) {
    console.error('Health check failed:', err);

    return res.status(503).json({
      status: 'degraded',
      api: 'up',
      database: 'down',
      target,
      timestamp
    });
  }
});

module.exports = router;
