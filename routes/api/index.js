const express = require('express');
const router = express.Router();

// router.use("/admin", require("./admin/index"))
router.use("/auth", require("./auth/index"));
router.use('/expert', require('./expert/index'));
router.use('/news', require('./news'))

module.exports = router;