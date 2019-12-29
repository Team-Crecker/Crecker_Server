var express = require('express');
var router = express.Router();
const defaultRes = require('../../../module/utils/utils');
const statusCode = require('../../../module/utils/statusCode');
const resMessage = require('../../../module/utils/responseMessage')
const db = require('../../../module/pool');
const jwtUtils = require('../../../module/jwt');

router.get('/', async (req, res) => {
    // Instantiate
    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.LOGIN_SUCCESS))
})

router.post('/withdraw', async (req, res) => {
    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.LOGIN_SUCCESS))
})

router.get('/detail/:type', async (req, res) => {
    // Instantiate
    // type, 1: 전체, 2: 입금, 3: 출금
    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.LOGIN_SUCCESS))
})

module.exports = router;
