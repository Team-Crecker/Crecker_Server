var express = require('express');
var router = express.Router();

const authUtil = require("../../../module/utils/authUtils");
var moment = require('moment');

const defaultRes = require('../../../module/utils/utils');
const statusCode = require('../../../module/utils/statusCode');
const resMessage = require('../../../module/utils/responseMessage')
const db = require('../../../module/pool');

router.get('/', authUtil.isLoggedin, async (req, res) => {  // 유저에게 줄 보너스와 배너에 저장되있는 유저의 idx를 SELECT
    console.log(req.decoded.idx)
    console.log(req.decoded.typeAd)
    console.log(req.decoded.typeExpert)
    console.log(req.decoded.typeNews)
});
module.exports = router;