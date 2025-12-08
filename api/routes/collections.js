const express = require('express');
const router = express.Router();
const { getCollections } = require('../controllers/collections');
const { getCollectionById } = require('../controllers/collectionById');

router.get('/', getCollections);
router.get('/:id', getCollectionById);

module.exports = router;
