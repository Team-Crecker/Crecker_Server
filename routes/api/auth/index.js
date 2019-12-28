var express = require('express');
var router = express.Router();

router.use("/login", require("./login"));
router.use("/signup", require("./signup"));
router.use("/refresh", require("./refresh"));

module.exports = router;
