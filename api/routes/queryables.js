const express = require('express');
const router = express.Router();
const { getQueryables } = require('../controllers/queryables');

router.get('/', getQueryables);

module.exports = router;