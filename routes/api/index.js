const express = require('express');
const router = express.Router();

// router.use("/admin", require("./admin/index"))
router.use("/auth", require("./auth/index"));

module.exports = router;