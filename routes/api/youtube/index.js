const express = require('express');
const router = express.Router();

router.use("/", require("./youtube"))


module.exports = router;
