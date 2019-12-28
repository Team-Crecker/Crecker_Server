var express = require("express");
var router = express.Router();

/* GET home page. */
router.use("/law", require("./law"));

module.exports = router;
//localhost:3000/
