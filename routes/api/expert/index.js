var express = require("express");
var router = express.Router();

/* GET home page. */
router.use("/law", require("./law"));
router.use("/", require("./expert"));
router.use("/qa", require("./qa"));

module.exports = router;