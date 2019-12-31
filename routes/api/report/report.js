var express = require('express');
var router = express.Router();
const defaultRes = require('../../../module/utils/utils');
const statusCode = require('../../../module/utils/statusCode');
const resMessage = require('../../../module/utils/responseMessage')
const db = require('../../../module/pool');
const jwtUtils = require('../../../module/jwt');
const authUtil = require("../../../module/utils/authUtils");


router.get('/', authUtil.isLoggedin ,async (req, res) => {
    // Instantiate
    const idx = req.decoded.idx
    
    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.LOGIN_SUCCESS))
})

router.get('/info', async (req, res) => {
    // Instantiate
    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.LOGIN_SUCCESS))
})


router.get('/:idx', async (req, res) => {
    // Instantiate
    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.LOGIN_SUCCESS))
})




module.exports = router;
