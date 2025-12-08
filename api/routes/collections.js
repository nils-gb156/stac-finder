const express = require('express');
const router = express.Router();
const { getCollections, getCollectionById } = require('../controllers/collections');

router.get('/', getCollections);
router.get('/:id', getCollectionById);

module.exports = router;
