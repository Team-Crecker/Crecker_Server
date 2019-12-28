const express = require('express')
const router = express.Router();

router.get('/', function (req, res) {
    const html = 'Crecker';
    res.send(html);
});

module.exports = router;