const express = require("express");
const router = express.Router();
const quickCommExecController = require("../controllers/QuickCommerceExecutiveController");

router.get("/", quickCommExecController.getQuickCommerceExecutive);

module.exports = router;
