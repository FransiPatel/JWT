const express = require('express');
const { getSearch } = require('../controllers/searchController');
const router = express.Router();

router.get('/search', getSearch);

module.exports = router;