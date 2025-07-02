const express = require("express");
const router = express.Router();
const quickCommerceController = require("../controllers/QuickCommerceController");

router.get("/", quickCommerceController.getQuickCommerce);

module.exports = router;
