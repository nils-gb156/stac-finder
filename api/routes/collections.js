const express = require('express');
const router = express.Router();
const { getCollections, getCollectionById } = require('../controllers/collections');
const { getQueryables } = require('../controllers/queryables');

router.get('/queryables', getQueryables);

router.get('/', getCollections);

router.get('/:id', getCollectionById);

module.exports = router;
