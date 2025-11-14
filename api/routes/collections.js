const express = require('express');
const router = express.Router();
const { getCollections } = require('../controllers/collections');

router.get('/', getCollections);

module.exports = router;
