const express = require('express');
const router = express.Router();

// router.use("/admin", require("./admin/index"))
router.use("/ad", require("./ad.js"));

module.exports = router;