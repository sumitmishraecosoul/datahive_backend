const express = require('express');
const router = express.Router();
const containerSummaryController = require('../controllers/containerSummaryController');

router.get('/sku', containerSummaryController.getContainerSKUData);

module.exports = router;
