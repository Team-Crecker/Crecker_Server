var express = require('express');
var router = express.Router();
const ShortUniqueId = require('short-unique-id');
const defaultRes = require('../../../module/utils/utils');
const statusCode = require('../../../module/utils/statusCode');
const resMessage = require('../../../module/utils/responseMessage')

router.get('/', async (req, res) => {
    // Instantiate
    const uid = new ShortUniqueId(8);
    const hashcode = uid.randomUUID(8)
    console.log(hashcode)
    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.LOGIN_SUCCESS))
})

module.exports = router;
