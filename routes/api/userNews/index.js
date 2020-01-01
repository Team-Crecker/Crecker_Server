const express = require('express');
const router = express.Router();

router.use("/", require("./supportNews"))


module.exports = router;
